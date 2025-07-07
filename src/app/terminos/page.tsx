import { Container, Title, Text, Stack, rem, Paper } from '@mantine/core';

export default function TermsPage() {
  return (
    <Container size="md" py={rem(48)}>
      <Paper shadow="md" radius="xl" p={rem(32)} style={{ background: '#fff', border: 'none' }}>
        <Stack gap={rem(24)}>
          <Title order={1} style={{ fontSize: rem(32), fontWeight: 800, color: '#f7945e', textAlign: 'center' }}>
            Términos y Condiciones
          </Title>
          <Text style={{ fontSize: rem(18), color: '#3B2C23', textAlign: 'center' }}>
            Por favor, lee cuidadosamente estos términos y condiciones antes de utilizar KADESH.
          </Text>

          <Title order={2} style={{ fontSize: rem(22), color: '#f7945e', marginTop: rem(16) }}>
            1. Identidad de la plataforma
          </Title>
          <Text style={{ fontSize: rem(16), color: '#3B2C23' }}>
            KADESH es una plataforma operada y gestionada por el Ing. Marco Castañeda, con sede en México.
          </Text>

          <Title order={2} style={{ fontSize: rem(22), color: '#f7945e', marginTop: rem(16) }}>
            2. Objeto de la plataforma
          </Title>
          <Text style={{ fontSize: rem(16), color: '#3B2C23' }}>
            KADESH tiene como objetivo conectar adoptantes, rescatistas, veterinarias y tiendas para el bienestar animal, así como intermediar en procesos de adopción y facilitar pagos y donaciones.
          </Text>

          <Title order={2} style={{ fontSize: rem(22), color: '#f7945e', marginTop: rem(16) }}>
            3. Registro y cuentas
          </Title>
          <Text style={{ fontSize: rem(16), color: '#3B2C23' }}>
            Cualquier persona mayor de 13 años puede registrarse en KADESH. Para crear una cuenta, se solicitarán los siguientes datos personales: nombre, correo electrónico, teléfono y sexo.
          </Text>

          <Title order={2} style={{ fontSize: rem(22), color: '#f7945e', marginTop: rem(16) }}>
            4. Uso permitido y prohibido
          </Title>
          <Text style={{ fontSize: rem(16), color: '#3B2C23' }}>
            No está permitido publicar contenido que promueva el maltrato animal, spam, información falsa, ni ningún otro contenido que vaya en contra de la ley o de los valores de la comunidad. KADESH se reserva el derecho de moderar y eliminar contenido inapropiado.
          </Text>

          <Title order={2} style={{ fontSize: rem(22), color: '#f7945e', marginTop: rem(16) }}>
            5. Donaciones y pagos
          </Title>
          <Text style={{ fontSize: rem(16), color: '#3B2C23' }}>
            Las donaciones realizadas a través de la plataforma se depositan en una cuenta de KADESH y son destinadas a apoyar casos y necesidades de animales. KADESH solo facilita el proceso de pago y no cobra comisión adicional. Si requieres un reembolso, puedes solicitarlo a través de los canales de contacto.
          </Text>

          <Title order={2} style={{ fontSize: rem(22), color: '#f7945e', marginTop: rem(16) }}>
            6. Privacidad y protección de datos
          </Title>
          <Text style={{ fontSize: rem(16), color: '#3B2C23' }}>
            Los datos personales solicitados (nombre, correo electrónico, teléfono y sexo) se utilizan únicamente para identificarte en la plataforma y enviarte notificaciones relevantes. KADESH no comparte tus datos con terceros bajo ninguna circunstancia.
          </Text>

          <Title order={2} style={{ fontSize: rem(22), color: '#f7945e', marginTop: rem(16) }}>
            7. Responsabilidad
          </Title>
          <Text style={{ fontSize: rem(16), color: '#3B2C23' }}>
            KADESH no es responsable de los animales, adopciones, rescates ni pagos realizados a través de la plataforma. Solo facilitamos el proceso y la conexión entre usuarios. El uso de la plataforma es bajo tu propio riesgo.
          </Text>

          <Title order={2} style={{ fontSize: rem(22), color: '#f7945e', marginTop: rem(16) }}>
            8. Propiedad intelectual
          </Title>
          <Text style={{ fontSize: rem(16), color: '#3B2C23' }}>
            Todo el contenido subido a la plataforma (fotos, textos, etc.) pasa a ser propiedad de KADESH. El uso del logo, nombre y marca de KADESH está restringido únicamente a personas autorizadas y no puede utilizarse para fines lucrativos o sin permiso expreso.
          </Text>

          <Title order={2} style={{ fontSize: rem(22), color: '#f7945e', marginTop: rem(16) }}>
            9. Modificaciones y contacto
          </Title>
          <Text style={{ fontSize: rem(16), color: '#3B2C23' }}>
            KADESH se reserva el derecho de modificar estos términos y condiciones en cualquier momento. Los cambios serán notificados a través de la plataforma. Para cualquier duda o aclaración, puedes contactarnos por correo electrónico o WhatsApp.
          </Text>
          <Text style={{ fontSize: rem(15), color: '#888', marginTop: rem(32), textAlign: 'center' }}>
            Última actualización: Julio 2025
          </Text>
        </Stack>
      </Paper>
    </Container>
  );
} 