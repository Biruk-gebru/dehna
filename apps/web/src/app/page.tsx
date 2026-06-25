export default function Home() {
  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 'var(--space-4)',
      }}
    >
      <h1
        style={{
          fontSize: 'var(--font-size-xl)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-text)',
        }}
      >
        ደህና
      </h1>
      <p
        style={{
          fontSize: 'var(--font-size-base)',
          color: 'var(--color-text-muted)',
        }}
      >
        Be well.
      </p>
    </main>
  );
}
