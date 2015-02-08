/**
 * Created by cristianorosario on 14/01/15.
 */
var db = require('./db');

function Queixinha(sTittle, sDescription, iAuthor, iId, like, likeId, tCreationDate, sAuthor, iTotalQueixinhas, bClosed, bSeenUpdate) {
    this.tittle = sTittle;
    this.description = sDescription;
    this.author = iAuthor;
    this.id = iId;
    this.like = like;
    this.likeId = likeId;
    this.creationDate = tCreationDate;
    this.username = sAuthor;
    this.total = iTotalQueixinhas;
    this.closed = bClosed;
    this.seenUpdate = bSeenUpdate;
}

function verifyExistsQueixinhaLike(iQueixinhaId, iUserId, fnCallback) {
    var params = [iQueixinhaId, iUserId];
    var createPartialQueixinha = function (row) {
        return new Queixinha(null, null, row.user_id, row.queixinha_id, row.state, row.id);
    };
    db.selectOne("select * from queixinhas.queixinha_likes where queixinha_id=$1 and user_id=$2",
        params,
        createPartialQueixinha,
        function (err, oResult) {
            if (err)
                return fnCallback(err);
            if (oResult == null)
                fnCallback(err, false);
            else
                fnCallback(err, oResult);
        });
}

function insertNewLike(iQueixinhaId, iUserId, bLike, fnCallback) {
    var params = [iUserId, iQueixinhaId, bLike];
    db.executeQuery("insert into queixinhas.queixinha_likes(user_id, queixinha_id, state) values($1, $2, $3) returning *", params, fnCallback);
}

function updateLastUpdateDate(iQueixinhaId, fnCallback) {
    var params = [iQueixinhaId];
    db.executeQuery("update queixinhas.queixinha set last_update = now() where id = $1", params, function (err) {
        if (err) return fnCallback(err);
        db.executeQuery("update queixinhas.queixinha_follow set seen_update = false where queixinha_id = $1", params, function (err) {
            fnCallback(err);
        });
    });
}

Queixinha.getQueixinha = function (iId, iUserId, fnCallback) {
    var params = [iId, iUserId];
    db.selectOne(
        "SELECT queixinha.id, tittle, description, author, to_char(creation_date, 'HH24:MI DD-MM-YYYY') as creation_date, username, queixinha_likes.user_id, queixinha_likes.state, queixinha.closed " +
        "from queixinhas.queixinha inner join queixinhas.users on(queixinha.author = users.id) " +
        "left join queixinhas.queixinha_likes on (queixinha.id = queixinha_likes.queixinha_id and queixinha_likes.user_id=$2) " +
        "where queixinha.id=$1",
        params,
        function (row) {
            return new Queixinha(row.tittle, row.description, row.author, row.id, row.state, row.user_id, row.creation_date, row.username, null, row.closed);
        },
        function (err, oResult) {
            if (err)
                fnCallback(err);
            db.executeQuery("update queixinhas.queixinha_follow set seen_update = true where queixinha_id = $1 and user_id = $2", params, function (err) {
                if (err)
                    fnCallback(err);
                fnCallback(err, oResult);
            });
        });
};

Queixinha.getFollowedQueixinhas = function (iPage, iUserId, fnCallback) {
    var params = [iUserId, iPage * 10];
    db.selectAll(
        "select queixinha.tittle, queixinha.description, queixinha.author, queixinha.id, to_char(queixinha.last_update,'HH24:MI DD-MM-YYYY') as date, users.username, totalCount.total, queixinha.closed, queixinha_follow.seen_update " +
        "from queixinhas.queixinha inner join queixinhas.queixinha_follow on(queixinha.id = queixinha_follow.queixinha_id) inner join queixinhas.users on (queixinha.author = users.id), " +
        "(select count(*) as total from queixinhas.queixinha_follow where user_id = $1 ) as totalCount " +
        "where queixinha_follow.user_id = $1 " +
        "order by queixinha.last_update desc " +
        "limit 10 offset $2",
        params, function (row) {
            //sTittle, sDescription, iAuthor, iId, like, likeId, tCreationDate, sAuthor, iTotalQueixinhas, bClosed, bSeenUpdate
            return new Queixinha(row.tittle, row.description, row.author, row.id, null, null, row.date, row.username, row.total, row.closed, row.seen_update);
        }, fnCallback
    );
};

Queixinha.getSome = function (iPage, fnCallback) {
    db.selectAll(
        "select tittle, description, author, queixinha.id, users.username, to_char(queixinha.creation_date, 'HH24:MI DD-MM-YYYY') as date, closed " +
        "from queixinhas.queixinha inner join queixinhas.users on (queixinha.author = users.id) " +
        "where closed = false " +
        "order by queixinha.creation_date desc " +
        "limit 10",
        [], function (row) {
            return new Queixinha(row.tittle, row.description, row.author, row.id, null, null, row.date, row.username, 1, row.closed);
        }, fnCallback)
};

Queixinha.getAll = function (iPage, iUserId, fnCallback) {
    db.selectAll(
        "Select tittle, description, author, queixinha.id, users.username, totalCount.total, queixinha_likes.user_id, queixinha_likes.state " +
        "from queixinhas.queixinha inner join queixinhas.users on (queixinha.author = users.id) " +
        "left join queixinhas.queixinha_likes on (queixinha.id = queixinha_likes.queixinha_id and queixinha_likes.user_id=$2), " +
        "(select count(id) as total from queixinhas.queixinha where closed = false) as totalCount " +
        "where closed = false " +
        "order by queixinha.creation_date desc " +
        "limit 10 OFFSET $1",
        [iPage * 10, iUserId], function (row) {
            return new Queixinha(row.tittle, row.description, row.author, row.id, row.state, row.user_id, null, row.username, row.total);
        }, fnCallback);
};

Queixinha.getAllClosed = function (iPage, iUserId, fnCallback) {
    db.selectAll(
        "Select tittle, description, author, queixinha.id, users.username, totalCount.total, queixinha_likes.user_id, queixinha_likes.state " +
        "from queixinhas.queixinha inner join queixinhas.users on (queixinha.author = users.id) " +
        "left join queixinhas.queixinha_likes on (queixinha.id = queixinha_likes.queixinha_id and queixinha_likes.user_id=$2), " +
        "(select count(id) as total from queixinhas.queixinha where closed = false) as totalCount " +
        "where closed = true " +
        "order by queixinha.creation_date desc " +
        "limit 10 OFFSET $1",
        [iPage * 10, iUserId], function (row) {
            return new Queixinha(row.tittle, row.description, row.author, row.id, row.state, row.user_id, null, row.username, row.total);
        }, fnCallback);
};

Queixinha.createQueixinha = function (oQueixinha, fnCallback) {
    var params = [oQueixinha.tittle, oQueixinha.description, oQueixinha.author];
    db.executeQuery("insert into queixinhas.queixinha(tittle, description, author, creation_date, last_update) values ($1, $2, $3, now(), now()) returning id", params,
        function (err, oResult) {
            if (err) return fnCallback(err);
            fnCallback(err, oResult.rows[0].id);
        });
};

Queixinha.edit = function (oQueixinha, fnCallback) {
    var params = [oQueixinha.tittle, oQueixinha.description, oQueixinha.id];
    updateLastUpdateDate(oQueixinha.id, function (err) {
        if (err)
            return fnCallback(err);
        db.executeQuery("update queixinhas.queixinha set tittle = $1, description = $2 where id = $3 returning id;", params, fnCallback);
    });
};

Queixinha.like = function (iQueixinhaId, iUserId, fnCallback) {
    verifyExistsQueixinhaLike(iQueixinhaId, iUserId, function (err, oResult) {
        if (err)
            return fnCallback(err);
        if (oResult) {
            if (oResult.like != true)
                db.executeQuery("update queixinhas.queixinha_likes set state = $1 where id = $2 returning id",
                    [oResult.like == null ? true : null, oResult.likeId],
                    function (err, oResult) {
                        if (err)
                            return fnCallback(err);
                        return fnCallback(err, oResult.rows);
                    });
            else
                return fnCallback(err, "alreadyLiked!");
        }
        else {
            insertNewLike(iQueixinhaId, iUserId, true, function (err, oResult) {
                return fnCallback(err, oResult.rows)
            });
        }
    });
};

Queixinha.dislike = function (iQueixinhaId, iUserId, fnCallback) {
    verifyExistsQueixinhaLike(iQueixinhaId, iUserId, function (err, oResult) {
        if (err)
            return fnCallback(err);
        if (oResult) {
            if (oResult.like != false) {
                db.executeQuery("update queixinhas.queixinha_likes set state = $1 where id = $2 returning id",
                    [oResult.like == null ? false : null, oResult.likeId],
                    function (err, oResult) {
                        if (err)
                            return fnCallback(err);
                        return fnCallback(err, oResult.rows);
                    }
                )
            } else {
                return fnCallback(err, "already disliked!");
            }
        } else {
            insertNewLike(iQueixinhaId, iUserId, false, function (err, oResult) {
                return fnCallback(err, oResult.rows);
            });
        }
    });
};

Queixinha.createComment = function (oQueixinha, fnCallback) {
    updateLastUpdateDate(oQueixinha.id, function (err) {
        if (err)
            return fnCallback(err);
        db.executeQuery("insert into queixinhas.queixinha_comments(user_id, queixinha_id, comment, creation_date) values ($1, $2, $3, now()) returning id",
            [oQueixinha.author, oQueixinha.id, oQueixinha.description],
            function (err, oResult) {
                if (err)
                    return fnCallback(err);
                return fnCallback(err, oResult);
            });
    });
};

Queixinha.follow = function (iQueixinhaId, iUserId, fnCallback) {
    var params = [iUserId, iQueixinhaId];
    this.getQueixinha(iQueixinhaId, iUserId, function (err, oQueixinha) {
        if (err)
            return fnCallback(err);
        if (oQueixinha.author == iUserId)
            return fnCallback(err, false);
        db.selectOne("select * from queixinhas.queixinha_follow where user_id = $1 and queixinha_id = $2", params, null, function (err, oResult) {
            if (err)
                return fnCallback(err);
            if (oResult)
                return fnCallback(null, false);
            db.executeQuery("insert into queixinhas.queixinha_follow(user_id, queixinha_id, seen_update) values ($1, $2, false) returning id", params, fnCallback);
        });
    });
};

Queixinha.getComments = function (iQueixinhaId, iPage, fnCallback) {
    var params = [iQueixinhaId, iPage * 10];
    db.selectAll("" +
        "select comment, to_char(creation_date, 'HH24:MI DD-MM-YYYY') as creation_date, username, username, total.total_comments " +
        "from queixinhas.queixinha_comments inner join queixinhas.users on (queixinha_comments.user_id = users.id)," +
        "(select count(id) total_comments from queixinhas.queixinha_comments where queixinha_id = $1) as total " +
        "where queixinha_id = $1 " +
        "order by queixinha_comments.id asc " +
        "limit 10 OFFSET $2",
        params, null, function (err, oResult) {
            if (err)
                return fnCallback(err);
            fnCallback(err, oResult.rows);
        }
    );
};

Queixinha.close = function (iQueixinhaId, iUserId, sComment, fnCallback) {
    var params = [iQueixinhaId];
    this.createComment(new Queixinha(null, sComment, iUserId, iQueixinhaId), function (err, oResult) {
        if (err)
            return fnCallback(err);
        db.executeQuery("update queixinhas.queixinha set closed = true where id = $1", params, fnCallback);
    });
};

module.exports.Queixinha = Queixinha;