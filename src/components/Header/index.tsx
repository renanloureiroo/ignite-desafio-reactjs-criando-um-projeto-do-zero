import Image from 'next/image';
import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={styles.container}>
      <div className={styles.content}>
        <Image src="/images/logo.svg" height="25" width="238" />
      </div>
    </header>
  );
}
