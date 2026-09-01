import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1600px',
          height: '900px',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg,#faf8f4 0%,#f4efe8 55%,#eee6dc 100%)',
          color: '#1b1b1d',
          fontFamily: 'Arial, sans-serif',
          padding: '54px 64px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '28px', fontWeight: 700 }}>
            <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', background: '#16161a', color: '#fff', fontSize: '18px' }}>VT</div>
            VivaTrip
          </div>
          <div style={{ display: 'flex', gap: '34px', alignItems: 'center', fontSize: '17px', color: '#555158' }}>
            <span>Explore deals</span><span>Price alerts</span><span>How it works</span><span style={{ color: '#1b1b1d', fontWeight: 700 }}>EN · USD</span>
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: '62px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: '47%' }}>
            <div style={{ fontSize: '17px', letterSpacing: '3px', textTransform: 'uppercase', color: '#846e59', marginBottom: '26px' }}>✦ One search. The whole world.</div>
            <div style={{ fontSize: '84px', lineHeight: 0.96, letterSpacing: '-5px', fontWeight: 700 }}>Go anywhere.<br/><span style={{ color: '#ab694f', fontStyle: 'italic' }}>Spend less.</span></div>
            <div style={{ marginTop: '32px', fontSize: '24px', lineHeight: 1.45, color: '#5e5a5b', maxWidth: '690px' }}>Compare flights, miles and member-only fares from trusted travel partners worldwide — all in one beautifully simple search.</div>
          </div>

          <div style={{ width: '53%', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,.86)', border: '1px solid rgba(40,30,20,.12)', borderRadius: '30px', padding: '28px', boxShadow: '0 30px 80px rgba(65,45,25,.14)' }}>
            <div style={{ display: 'flex', gap: '24px', fontSize: '16px', fontWeight: 700, marginBottom: '24px' }}><span>● Round trip</span><span style={{ color: '#8d8882' }}>○ One way</span><span style={{ color: '#8d8882' }}>○ Multi-city</span></div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[['From','São Paulo (SAO)'],['To','Lisbon (LIS)']].map(([label,value]) => <div key={label} style={{ display:'flex', flexDirection:'column', flex:1, border:'1px solid #ded8d0', borderRadius:'16px', padding:'16px 18px' }}><span style={{fontSize:'13px',color:'#8a837d'}}>{label}</span><span style={{fontSize:'20px',fontWeight:700,marginTop:'6px'}}>{value}</span></div>)}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              {[['Depart','Oct 12, 2026'],['Return','Oct 24, 2026'],['Travelers','1 · Economy']].map(([label,value]) => <div key={label} style={{ display:'flex', flexDirection:'column', flex:1, border:'1px solid #ded8d0', borderRadius:'16px', padding:'14px 16px' }}><span style={{fontSize:'12px',color:'#8a837d'}}>{label}</span><span style={{fontSize:'16px',fontWeight:700,marginTop:'5px'}}>{value}</span></div>)}
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'18px' }}><span style={{fontSize:'15px',color:'#69635e'}}>✓ Searches 120+ trusted travel sites</span><div style={{background:'#1f1e1d',color:'#fff',padding:'16px 24px',borderRadius:'14px',fontSize:'17px',fontWeight:700}}>Search the world →</div></div>
          </div>
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid rgba(30,20,10,.12)', paddingTop:'24px', color:'#706963', fontSize:'16px' }}><span>Compared across</span><b>Airlines</b><b>Mileage programs</b><b>Travel partners</b><b>Member fares</b></div>
      </div>
    ),
    { width: 1600, height: 900 },
  );
}
