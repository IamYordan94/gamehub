// Simple loading skeleton with Sticker Pack styling
export default function LoadingSkeleton({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div style={{
        display: 'flex', gap: '8px',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '48px', height: '48px',
            background: '#ffffff', border: '2.5px solid #141414',
            borderRadius: '12px', boxShadow: '4px 4px 0 #141414',
            animation: `pulse 1.2s ${i * 0.15}s infinite`,
          }} />
        ))}
      </div>
      <span className="text-sm font-bold" style={{ color: '#6f6a5e', fontFamily: "'JetBrains Mono', monospace" }}>
        {text}
      </span>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(-4px); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
