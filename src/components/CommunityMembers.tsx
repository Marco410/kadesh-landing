import { SimpleGrid, Paper, Avatar, Text, Title, Badge, rem, Stack } from '@mantine/core';

const members = [
  {
    name: 'María',
    role: 'Donadora',
    emoji: '🙎🏻‍♀️',
    type: 'Donador',
  },
  {
    name: 'Carlos',
    role: 'Refugio Patitas',
    emoji: '👨🏻‍🦰',
    type: 'Refugio',
  },
  {
    name: 'Ana',
    role: 'Veterinaria Vida Animal',
    emoji: '👨🏽‍💼',
    type: 'Veterinaria',
  },
  {
    name: 'Luis',
    role: 'Tienda PetShop',
    emoji: '🙎🏾‍♂️',
    type: 'Tienda',
  },
  {
    name: 'Viri',
    role: 'Refugio amor por ellos',
    emoji: '🧑🏻‍🦰',
    type: 'Refugio',
  },
  {
    name: 'Regina',
    role: 'Donadora',
    emoji: '🧑🏻',
    type: 'Donador',
  },
];

const typeColors: Record<string, string> = {
  Donador: 'orange',
  Refugio: 'green',
  Veterinaria: 'blue',
  Tienda: 'brown',
};

export default function CommunityMembers() {
  return (
    <div style={{ width: '100%', background: '#FFF4EC', padding: '48px 0' }}>
      <Stack gap={rem(24)} align="center" mb={rem(50)} >
        <Title order={2} style={{ color: '#f7945e', fontWeight: 800, fontSize: rem(28), textAlign: 'center' }}>
          Comunidad KADESH
        </Title>
        <Text style={{ color: '#3B2C23', fontSize: rem(18), textAlign: 'center', maxWidth: 600 }}>
          Aquí aparecerán las personas y aliados que forman parte de la comunidad KADESH: donadores, refugios, veterinarias y tiendas.
        </Text>
      </Stack>
      <SimpleGrid cols={{ base: 3, sm: 3, md: 4, lg: 6, xl:8 }} spacing={10} px={0} mt={140} p={25} >
        {members.map((m, i) => (
          <Paper
            key={i}
            shadow="md"
            radius="lg"
            p={8}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fff',
              width: '100%',
              minWidth: 90,
              height: 150,
              minHeight: 150,
              margin: '0 auto',
              position: 'relative',
            }}
          >
            <Avatar size={40} radius={32} style={{ marginBottom: rem(6), fontSize: rem(16), background: '#FFF4EC', color: '#f7945e' }}>
              {m.emoji}
            </Avatar>
            <Text fw={700} fz={12} c="#f7945e" mb={1} style={{ textAlign: 'center' }}>{m.name}</Text>
            <Text fz={11} c="#3B2C23" mb={4} style={{ textAlign: 'center' }}>{m.role}</Text>
            <Badge color={typeColors[m.type]} variant="light" size="xs" style={{ fontWeight: 600, fontSize: 10, marginTop: 1 }}>
              {m.type}
            </Badge>
          </Paper>
        ))}
      </SimpleGrid>
    </div>
  );
} 