import { useTranslation } from '../i18n';
import { Link } from 'react-router-dom';
import SilentSpeakerIcon from '../components/icons/SilentSpeakerIcon';

const NotFound = () => {
    const { t } = useTranslation();
    
    return (
        <div
            style={{
                margin: "auto",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                justifyContent: "center",
                color: "var(--text-color)",
                fontFamily: "Arial, sans-serif",
                gap: '1em',
            }}
        >
            <SilentSpeakerIcon
                style={{
                    width: "100px",
                    height: "100px",
                    opacity: 0.6,
                }} />

            <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", opacity: 0.6 }}>{t("notFound404")}</h1>
            <p style={{ fontSize: "1.2rem", opacity: 0.6  }}>
                {t("pageNotFoundMessage") || "Dead silent here... No music playing!"}
            </p>
            <p style={{ color: "var(--text-color)", opacity: 0.6  }}>
                {t("pageNotFoundJokeMessage")}
            </p>
            <Link
                to="/"
                style={{
                    marginTop: "1em",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    backgroundColor: "var(--button-color)",
                    color: "var(--text-color)",
                    textDecoration: "none",
                    fontWeight: "bold",
                }}
            >
                🎵 {t("goBackToHome")}
            </Link>
        </div>
    );
};

export default NotFound;