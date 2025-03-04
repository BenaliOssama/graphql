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

  totalXpQuery: function (module) {
    return `{
    transaction_aggregate(where: { 
      type: { _eq: "xp" }, 
      eventId: { _eq: ${module}}
      #eventId: { _nin: [11, 67] }
      #eventId: { _in: [41, 11] }
      }) {
        aggregate {
          sum {
              amount
          }
        }
      }
    }`
  },

  individualXpQuery: function (module) {
    return ` {
            transaction(where: {
                type: { _eq: "xp" },
                eventId: { _eq: ${module}}
            }, order_by: { createdAt: desc }) {
                path
                amount
                createdAt
            }
        }`},
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
  lastProjectsQuery: function (max) {
    return `{
      user {
        transactions(limit: ${max}, where: {type: {_eq: "xp"}}, order_by: {createdAt: desc}) {
          object {
            name
          }
          amount
          createdAt
        }
      }
    }`
  },
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
  }`,
  userCohortQuery: `{
    user {
      events{
        event {
          object {
            name 
            type
          }
          startAt
          id
        }
      }
    }
  }`
}