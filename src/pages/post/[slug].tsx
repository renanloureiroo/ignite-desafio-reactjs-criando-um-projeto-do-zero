import { GetStaticPaths, GetStaticProps } from 'next';

import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { MdOutlineWatchLater } from 'react-icons/md';

import Image from 'next/image';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Head from 'next/head';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

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
  const router = useRouter();
  const readingTime = Math.ceil(
    post.data.content.reduce((total, contentSection) => {
      const heading = String(contentSection.heading).split(' ');
      const body = RichText.asText(contentSection.body).split(' ');

      const count = heading.length + body.length;

      return total + count;
    }, 0) / 200
  );

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | Post</title>
      </Head>
      <main className={`${styles.container}`}>
        <Image
          src={post.data.banner.url}
          alt="banner"
          width="1440"
          height="400"
          layout="responsive"
        />
        <div className={commonStyles.container}>
          <div className={styles.header}>
            <h1>{post.data.title}</h1>

            <div className={styles.footer}>
              <div>
                <FiCalendar />
                <span className={commonStyles.info}>
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </span>
              </div>
              <div>
                <FiUser />
                <span className={commonStyles.info}>{post.data.author}</span>
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
                <article key={content.heading.toLowerCase().trim()}>
                  <h2>{content.heading}</h2>
                  <main
                    dangerouslySetInnerHTML={{
                      __html: RichText.asHtml(content.body),
                    }}
                  />
                </article>
              ))}
          </section>
        </div>
      </main>
    </>
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
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => {
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
