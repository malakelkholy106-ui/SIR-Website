(function () {
  const ready = window.SIR_SUPABASE_URL &&
    window.SIR_SUPABASE_PUBLISHABLE_KEY &&
    !window.SIR_SUPABASE_PUBLISHABLE_KEY.includes('PASTE_YOUR');

  window.SIR_SUPABASE_READY = !!ready;
  if (ready && window.supabase) {
    window.sirSupabase = window.supabase.createClient(
      window.SIR_SUPABASE_URL,
      window.SIR_SUPABASE_PUBLISHABLE_KEY
    );
  } else {
    window.sirSupabase = null;
  }
})();
