import styles from './GiveawayLoader.module.css';

function GiveawayLoader() {
  return (
    <div className={styles.loaderWrap} aria-label="Loading giveaway">
      <div className={styles.loaderRing}>
        <div className={styles.loaderCore} />
      </div>
      <p className={styles.loaderText}>Loading rewards...</p>
    </div>
  );
}

export default GiveawayLoader;
