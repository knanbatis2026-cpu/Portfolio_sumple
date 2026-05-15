document.addEventListener('click', async (e) => {
  const link = e.target.closest('a');
  
  // 対象外のリンク（別ドメインや別タブ）は無視
  if (!link || link.origin !== location.origin || link.target === '_blank') return;

  // ローカル環境(file://)の場合は、fetchエラーが出るためアニメーションせず普通に移動
  if (location.protocol === 'file:') return;

  e.preventDefault();
  const targetUrl = link.href;

  // View Transitions API または fetch の失敗に備えて try-catch で囲む
  try {
    if (!document.startViewTransition) {
      throw new Error('View Transition API not supported');
    }

    document.startViewTransition(async () => {
      const response = await fetch(targetUrl);
      
      // レスポンスが正常(200 OK)でない場合はエラーを投げる
      if (!response.ok) throw new Error('Fetch failed');

      const text = await response.text();
      const newHtml = new DOMParser().parseFromString(text, 'text/html');
      
      document.body.innerHTML = newHtml.body.innerHTML;
      document.title = newHtml.title;
      history.pushState({}, '', targetUrl);
    });
  } catch (error) {
    // 権限エラーや非対応ブラウザの場合は、通常のリンク移動を実行
    console.warn('Animation failed, falling back to normal navigation:', error);
    location.href = targetUrl;
  }
});