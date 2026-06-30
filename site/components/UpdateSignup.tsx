export function UpdateSignup() {
  return (
    <section className="updates-signup" aria-label="Subscribe for updates">
      <p className="eyebrow">Newsletter</p>
      <h1 className="type-h1">Follow DORAEMON updates.</h1>
      <p>
        Dataset releases, OpenDC status, workshop notes, and baseline model updates.
      </p>
      <form className="updates-form">
        <input aria-label="Email address" placeholder="you@example.com" type="email" />
        <button type="button">Subscribe</button>
      </form>
      <p className="updates-note">No spam. Unsubscribe anytime.</p>
    </section>
  );
}
