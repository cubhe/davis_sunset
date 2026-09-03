import { ArrowDown, Clock3, Compass, MapPin, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#today" aria-label="Davis 晚霞首页">
          <span className="brand-mark" aria-hidden="true" />
          <span>Davis 晚霞</span>
        </a>
        <nav aria-label="主要导航">
          <a href="#today">今晚</a>
          <a href="#details">判断依据</a>
          <a href="#archive">往日记录</a>
        </nav>
      </header>

      <section className="hero" id="today">
        <img className="hero-photo" src="/davis-fields-sunset.jpg" alt="夕阳照亮 UC Davis 西侧田野" />
        <div className="hero-shade" />
        <div className="hero-content">
          <div className="eyebrow"><MapPin size={14} aria-hidden="true" />Davis, California · 9月2日 周三</div>
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="kicker">今晚值得追吗？</p>
              <h1>看运气，出门前先抬头看一眼西边天空</h1>
              <div className="sun-meta" aria-label="日落信息">
                <span><Clock3 size={17} /> 日落 <strong>19:35</strong></span>
                <span><Compass size={17} /> 方位 <strong>279°</strong></span>
              </div>
            </div>
            <div className="score-card" aria-label="晚霞指数 5 分，满分 10 分">
              <span className="score-label">晚霞指数</span>
              <div><strong>5</strong><span>/10</span></div>
              <p><Sparkles size={14} /> 条件很好，云是未知数</p>
            </div>
          </div>
          <a className="scroll-cue" href="#details">看详细判断 <ArrowDown size={15} /></a>
        </div>
      </section>

      <section className="brief" id="details" aria-labelledby="brief-title">
        <div className="section-heading">
          <p className="kicker">Tonight at a glance</p>
          <h2 id="brief-title">所有地面条件都在等一片云</h2>
          <p>西边通道全开、零低云、空气干净。若有卷云，就可能烧透；最大风险是纯净空天。</p>
        </div>
        <div className="factor-preview">
          <article><span>进光通道</span><strong>完全打开</strong><em>低云 0 · 中云 0</em></article>
          <article><span>高云量</span><strong>模式分歧</strong><em>ECMWF 70% · GFS 1%</em></article>
          <article><span>空气质量</span><strong>非常干净</strong><em>AOD 0.11 · PM₂.₅ 5.5</em></article>
        </div>
      </section>

      <section className="archive-preview" id="archive">
        <p className="kicker">Archive</p>
        <h2>往日晚霞</h2>
        <p>每天的判断会按日期自动归档在这里。</p>
      </section>

      <footer><span>Davis 晚霞 · 每日下午更新</span><span>田野照片：UC Davis / L. Gerhart Bailey</span></footer>
    </main>
  );
}
