---
estado: implementado
fecha: 2026-11-17
origen: kadesh-landing@fix/cartel-horizontal-y-recompensa
feature: animals
---

# Prompt para kadesh-pet-mobile: recompensa en reportes de mascota perdida

## Contexto
Muchas familias ofrecen recompensa y la escribían en las señas, sin formato y sin advertencia. Ahora el reporte tiene dos campos: si se ofrece recompensa y, opcionalmente, el monto. Se muestra con un aviso antiestafa, porque a quien perdió una mascota le escriben muchos estafadores («la tengo, deposítame y te la regreso»).

## Qué implementar en la app
1. **Formularios de reporte y de edición**, solo con estado `lost`, después de los teléfonos:
   - Casilla «Ofrezco recompensa» con la ayuda «Sale en la ficha y en el cartel. Opcional.».
   - Al marcarla, un campo «Monto en pesos, si quieres publicarlo» (numérico, con `$` delante, ejemplo «2,000»). Es opcional.
   - Debajo: «Entrégala solo cuando tengas a tu mascota contigo. Nunca pagues por adelantado: es la estafa más común.».
   - Validación del monto: vacío está bien. Si tiene algo, debe ser un entero de 1 a 1,000,000. Errores: «Escribe el monto en pesos, o déjalo vacío.» o «El monto es demasiado alto.».
   - Al guardar se manda `rewardOffered: status === 'lost' && marcado` y `rewardAmount` (entero, o `null` si no hay monto o no se ofrece). Si el estado no es `lost`, se manda `rewardOffered: false` y `rewardAmount: null`.
2. **Ficha**, solo si el estado actual es `lost` y `rewardOffered` es verdadero: una franja ámbar con «Se ofrece recompensa: $2,000» (o «Se ofrece recompensa» sin monto) y el texto «Se entrega cuando la mascota está de vuelta con su familia. Si alguien te pide dinero por adelantado, es una estafa.».
3. El cartel y la imagen para historias ya la muestran (son de la web); la app no tiene que hacer nada ahí.

## GraphQL

```graphql
# Ficha: agrega los dos campos a la consulta que ya usa la app.
query GetAnimal($where: AnimalWhereUniqueInput!) {
  animal(where: $where) {
    id
    rewardOffered   # Boolean
    rewardAmount    # Int (pesos) o null
    # …lo demás
  }
}

# Crear / editar: mismos campos en `data` de createAnimal / updateAnimal.
# data: { …, rewardOffered: true, rewardAmount: 2000 }
```

## Reglas y constantes
- Solo en `lost`. En cualquier otro estado no se muestra aunque siga guardada.
- Formato del monto: `$` y separador de miles con coma («$2,000»).
- Si `rewardOffered` es falso, el back borra el monto.
- Tope del monto: 1,000,000 (`REWARD_MAX_MXN` en kadesh-back).
- Lanza esto en la app después del back y su migración: antes, los campos no existen.

## Referencia web
- `src/components/animals/nuevo/RewardField.tsx`
- `src/components/animals/reward.ts`
- `src/components/animals/detail/RewardBanner.tsx`

## Criterios de aceptación
- [ ] En un reporte perdido se puede ofrecer recompensa con y sin monto, y editarla o quitarla.
- [ ] En otros estados no aparece el campo ni la franja.
- [ ] La ficha muestra el aviso antiestafa.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
