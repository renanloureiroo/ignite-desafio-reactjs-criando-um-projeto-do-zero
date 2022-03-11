import { GetStaticPaths, GetStaticProps } from 'next';

import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { MdOutlineWatchLater } from 'react-icons/md';

import Image from 'next/image';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { formatDate } from '../../utils/formatDate';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const readingTime = Math.ceil(
    post.data.content.reduce((total, contentSection) => {
      const heading = String(contentSection.heading).split(' ');
      const body = RichText.asText(contentSection.body).split(' ');

      const count = heading.length + body.length;

      return total + count;
    }, 0) / 200
  );

  return (
    <main className={`${styles.container}`}>
      <Image
        src={post.data.banner.url}
        alt="banner"
        width="1440"
        height="400"
        layout="responsive"
      />
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h1>{post.data.title}</h1>

          <div className={styles.footer}>
            <div>
              <FiCalendar />
              <span>{post.first_publication_date}</span>
            </div>
            <div>
              <FiUser />
              <span>{post.data.author}</span>
            </div>

            <div>
              <MdOutlineWatchLater />
              <span>{readingTime} min</span>
            </div>
          </div>
        </div>

        <section className={styles.content}>
          {!!post &&
            post.data.content.map(content => (
              <div key={content.heading.toLowerCase().trim()}>
                <h2>{content.heading}</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </div>
            ))}
        </section>
      </div>
    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.slugs'],
      pageSize: 3,
    }
  );
  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date: formatDate(
      new Date(response.first_publication_date)
    ),
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => {
        console.log(content);
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 60, // 1 hour
  };
};
