import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import styles from './styles.module.scss';

interface PostPreviewProps {
  data: {
    uid?: string;
    first_publication_date: string | null;
    data: { title: string; subtitle: string; author: string };
  };
}

const PostPreview = ({ data }: PostPreviewProps): JSX.Element => {
  return (
    <Link href={`/post/${data.uid}`}>
      <a>
        <article className={styles.container}>
          <h1>{data.data.title}</h1>
          <strong>{data.data.subtitle}</strong>

          <footer>
            <div>
              <FiCalendar />
              <span>{data.first_publication_date}</span>
            </div>
            <div>
              <FiUser />
              <span>{data.data.author}</span>
            </div>
          </footer>
        </article>
      </a>
    </Link>
  );
};

export { PostPreview };
