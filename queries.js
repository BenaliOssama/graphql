export const queries = {
    userQuery: `{
                user{
                    login
                    firstName
                    lastName
                    attrs
                    auditRatio
                    campus
                    totalDown
                    totalUp
            }
}`,


    totalXpQuery: `{
    transaction_aggregate(where: { 
    type: { _eq: "xp" }, 
    eventId: { _eq: 41 }
    #eventId: { _nin: [11, 67] }
  }) {
    aggregate {
      sum {
        amount
      }
    }
  }
}`,
    individualXpQuery: ` {
            transaction(where: {
                type: { _eq: "xp" },
                eventId: { _eq: 41 }
            }, order_by: { createdAt: desc }) {
                path
                amount
            }
        }`,
    currentLevelQuery: `{
        transaction_aggregate(
            where:{
                type: { _eq: "level" }
                event : {object :{name:{_eq:"Module"}}}
                }
            order_by: { createdAt: desc }){aggregate {max {amount}}}
        }`,

    skillQuery: `{
            transaction(
                where: { type: { _like: "skill%" } }
                order_by: { amount: desc }) {
                type
                amount
            }
        }`,
    lastProjectsQuery : `{
          user {
            transactions(limit: 3, where: {type: {_eq: "xp"}}, order_by: {createdAt: desc}) {
              object {
                name
              }
              amount
              createdAt
            }
          }
        }`,
    auditQuery: `{
          user {
            audits_aggregate(where: {closureType: {_eq: succeeded}}) {
              aggregate {
                count
              }
            }
            failed_audits: audits_aggregate(where: {closureType: {_eq: failed}}) {
              aggregate {
                count
              }
            }
          }
        }`
}