import { gql } from "@apollo/client";

/**
 * Huellitas de la persona con sesión. Una consulta por pantalla: saldo, nivel, racha, posición y
 * los últimos 20 movimientos. Sin polling: se pide al abrir la vista.
 */
export const MY_PAWS_QUERY = gql`
  query MyPaws {
    myPaws {
      enabled
      balance
      lifetimeEarned
      level {
        level
        key
        label
        from
        nextAt
      }
      toNextLevel
      streakWeeks
      bestStreakWeeks
      streakActiveThisWeek
      rankingHidden
      rank
      history {
        id
        action
        kind
        amount
        createdAt
      }
    }
  }
`;

/** Más movimientos del historial, de 20 en 20 (`skip` = los que ya se ven). */
export const MY_PAW_HISTORY_QUERY = gql`
  query MyPawHistory($take: Int, $skip: Int) {
    myPawHistory(take: $take, skip: $skip) {
      id
      action
      kind
      amount
      createdAt
    }
  }
`;

export const SET_PAW_RANKING_VISIBILITY_MUTATION = gql`
  mutation SetPawRankingVisibility($hidden: Boolean!) {
    setPawRankingVisibility(hidden: $hidden) {
      success
      message
      rankingHidden
    }
  }
`;

/**
 * Resumen para Inicio del perfil: nivel, saldo, progreso y racha, sin historial. Va aparte de
 * `ProfileHome` para que, si falla, no tire el resto de Inicio.
 */
export const MY_PAWS_SUMMARY_QUERY = gql`
  query MyPawsSummary {
    myPaws {
      enabled
      balance
      lifetimeEarned
      level {
        level
        key
        label
        from
        nextAt
      }
      toNextLevel
      streakWeeks
      streakActiveThisWeek
      rankingHidden
      rank
    }
  }
`;
