import Image from 'next/image';
import Link from 'next/link';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.container}>
      <div className={styles.content}>
        <Link href="/">
          <a>
            <Image src="/images/logo.svg" height="25" width="238" alt="logo" />
          </a>
        </Link>
      </div>
    </header>
  );
}
