#Desenvolvimento de aplicações WEB

## Grupo 9
### Bruno Sousa Nº38479
### Cristiano Rosário Nº38243
### Pedro Carvalho Nº38235


# Estrutura

![](http://i.imgur.com/a5SMxF8.png)


# Portfolio
![](http://i.imgur.com/HPR9wwP.png)
* Portfolio
 * State (Estado de um portfolio)
 * PortfolioTable
   * State (Detalhe de um portfolio)


# Recomendações

![](http://i.imgur.com/jT5LTNO.png)
* RecommendationsSummaries
 * State (Estado de todas as recommendations pendentes de um portfolio)

![](http://i.imgur.com/ezLAWqo.png)
* RecommendationsDetails
 * State (Estado de todas as recommendations de um portfolio independentemente do estado das mesmas)
 * RecommendationDetails
   * State (Estado de uma recommendation)


# Trabalhos

![](http://i.imgur.com/LE3MyUK.png)
![](http://i.imgur.com/vLRhy57.png)
* Work
 * State (Estados de todos os works de um portfolio)
 * WorkItem
   * State (Estado de um work)
![](http://i.imgur.com/vmQy0bp.png)
* CreateWork
 * Handle (Contém os dados de input para a criação de um work)

# Grupos

![](http://i.imgur.com/JA0dfet.png)
* GroupList
 * State (Estados de todos os groups de um portfolio)
 * GroupItem
   * State (Estado de um group)

# Crachás

![](http://i.imgur.com/5s8Azpk.png)
* BadgeDetails
 * State (Estados de todos os badges de um portfolio)
 * BadgeDetail
   * State (Estado de um badge)

* BadgesSummary
 * State (Estados de todos os badges de um portfolio)
 * BadgeSummary
   * State (Estado de um badge)
