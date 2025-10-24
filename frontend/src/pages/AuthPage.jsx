import "../styles/auth.css";
import { SignInButton } from "@clerk/clerk-react";
import FeaturePopup from "../components/FeaturePopup";

const AuthPage = () => {
  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-hero">
          <div className="brand-container">
            <img src="/logo.png" alt="Tether" className="brand-logo" />
            <span className="brand-name">Tether</span>
          </div>

          <h1 className="hero-title">Where Work Happens ✨</h1>

          <p className="hero-subtitle">
            Connect with your team instantly through secure, real-time messaging. Experience
            seamless collaboration with powerful features designed for modern teams.
          </p>

          <div className="hero-kicker" style={{ marginBottom: "1rem", color: "#dbeafe", fontSize: "0.95rem" }}>
            Trusted by teams for fast, secure collaboration
          </div>

          <div className="features-list">
            <FeaturePopup
              id="realtime"
              overlay={true}
              contents={[
                <div key={0}>
                  <h2>Real-time messaging</h2>
                  <p>Instant 1:1 and group chat with presence and typing indicators.</p>
                  <ul>
                    <li>Read receipts & reactions</li>
                    <li>Rich media: images, files, links</li>
                  </ul>
                  <div style={{ marginTop: "1rem" }}>
                    <button className="cta-button">Try messaging demo</button>
                  </div>
                </div>,
                <div key={1}>
                  <h2>Channels & Threads</h2>
                  <p>Organize conversations into channels and threaded replies for focus.</p>
                  <ul>
                    <li>Private and public channels</li>
                    <li>Mentions and pins</li>
                  </ul>
                  <div style={{ marginTop: "1rem" }}>
                    <button className="cta-button">Learn about channels</button>
                  </div>
                </div>,
              ]}
            >
              <div className="feature-item">
                <span className="feature-icon">💬</span>
                <span>Real-time messaging</span>
              </div>
            </FeaturePopup>

            <FeaturePopup
              id="video"
              overlay={true}
              contents={[
                <div key={0}>
                  <h2>Video calls & meetings</h2>
                  <p>Start high-quality group calls with screen sharing.</p>
                  <ul>
                    <li>Multi-party video with speaker detection</li>
                    <li>Screen sharing & PIN to record</li>
                  </ul>
                  <div style={{ marginTop: "1rem" }}>
                    <button className="cta-button">Start a demo call</button>
                  </div>
                </div>,
                <div key={1}>
                  <h2>Meeting controls</h2>
                  <p>Hosts can mute participants, lock meetings, and manage attendees.</p>
                  <div style={{ marginTop: "1rem" }}>
                    <button className="cta-button">See meeting controls</button>
                  </div>
                </div>,
              ]}
            >
              <div className="feature-item">
                <span className="feature-icon">🎥</span>
                <span>Video calls & meetings</span>
              </div>
            </FeaturePopup>

            <FeaturePopup
              id="secure"
              overlay={true}
              contents={[
                <div key={0}>
                  <h2>Secure & private</h2>
                  <p>Security-first design with enterprise-grade controls.</p>
                  <ul>
                    <li>Role-based access, single sign-on</li>
                    <li>Encryption at rest and in transit</li>
                  </ul>
                  <div style={{ marginTop: "1rem" }}>
                    <button className="cta-button">Security overview</button>
                  </div>
                </div>,
                <div key={1}>
                  <h2>Compliance & Auditing</h2>
                  <p>Detailed audit logs, retention settings, and admin controls.</p>
                  <div style={{ marginTop: "1rem" }}>
                    <button className="cta-button">Compliance details</button>
                  </div>
                </div>,
              ]}
            >
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <span>Secure & private</span>
              </div>
            </FeaturePopup>
          </div>

          <SignInButton mode="modal">
            <button className="cta-button">
              Get Started with Tether
              <span className="button-arrow">→</span>
            </button>
          </SignInButton>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-image-container">
          <img src="/auth-i.png" alt="Team collaboration" className="auth-image" />
          <div className="image-overlay"></div>
        </div>
      </div>
    </div>
  );
};
export default AuthPage;
