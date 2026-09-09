function Library() {
    const links = [
        { name: 'VTU Life', url: 'https://vtulife.com' },
        { name: 'VTU Circle', url: 'https://vtucircle.com' },
        { name: 'VTU Sync', url: 'https://vtusync.com' },
        { name: 'VTU Results', url: 'https://results.vtu.ac.in' },
        { name: 'VTU Official Site', url: 'https://vtu.ac.in' },
        { name: 'RYMEC Official Site', url: 'https://rymec.org' }
    ]

    const cardStyle = {
        flex: 1,
        border: '1px solid #eaeaea',
        borderRadius: '12px',
        padding: '20px',
        backgroundColor: '#fafafa'
    }

    return (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ ...cardStyle, textAlign: 'center', minWidth: '240px' }}>
                <h4 style={{ marginTop: 0, color: '#222' }}>Question Paper Repository</h4>
                <img src="/library-qr.png" alt="Library QR Code" width="180" style={{ borderRadius: '8px', border: '1px solid #eee' }} />
                <p style={{ fontSize: '13px', color: '#888', marginTop: '10px' }}>Scan to access the question paper repository</p>
            </div>

            <div style={{ ...cardStyle, minWidth: '240px' }}>
                <h4 style={{ marginTop: 0, color: '#222' }}>Useful Links</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {links.map((link) => (
                        <li key={link.name} style={{ marginBottom: '10px' }}>
                            <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#333', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}
                                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                            >
                                🔗 {link.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default Library