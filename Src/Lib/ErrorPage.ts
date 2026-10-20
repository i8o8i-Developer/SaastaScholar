export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This Page Did Not Load — SaastaScholar</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 'Poppins', system-ui, -apple-system, sans-serif; background: #fafafa; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 1rem; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05); }
      h1 { font-size: 1.5rem; font-weight: 700; margin: 0 0 0.5rem; }
      p { color: #4b5563; margin: 0 0 1.5rem; font-size: 0.9rem; }
      .actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.625rem 1.25rem; border-radius: 0.75rem; font: inherit; font-size: 0.875rem; font-weight: 600; cursor: pointer; text-decoration: none; border: 1px solid transparent; transition: all 0.2s; }
      .primary { background: #059669; color: #fff; }
      .primary:hover { background: #047857; }
      .secondary { background: #fff; color: #111; border-color: #d1d5db; }
      .secondary:hover { border-color: #059669; color: #059669; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This Page Did Not Load</h1>
      <p>Something Went Wrong On Our End. You Can Try Refreshing Or Head Back Home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try Again</button>
        <a class="secondary" href="/">Go Home</a>
      </div>
    </div>
  </body>
</html>`;
}
