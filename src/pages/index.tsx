import Link from 'next/link';
import { GetStaticProps } from 'next';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { useState } from 'react';
import Head from 'next/head';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const { results, next_page } = postsPagination;

  const postsFormatted = results.map(post => {
    return {
      ...post,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
    };
  });
  const [posts, setPosts] = useState<Post[]>(postsFormatted);
  const [nextPage, setNextPage] = useState(next_page);

  const loadMostPost = (): void => {
    fetch(nextPage)
      .then(res => res.json())
      .then(response => {
        setNextPage(response.next_page);
        const result = response.results.map(post => {
          return {
            uid: post.slugs[0],
            first_publication_date: format(
              new Date(post.first_publication_date),
              'dd MMM yyyy',
              {
                locale: ptBR,
              }
            ),
            data: post.data,
          };
        });

        setPosts(oldValue => [...oldValue, ...result]);
      });
  };

  return (
    <>
      <Head>
        <title>Spacetraveling | Home</title>
      </Head>
      <main className={`${commonStyles.container} ${styles.container}`}>
        {!!posts &&
          posts.map(post => (
            <Link href={`/post/${post.uid}`}>
              <a>
                <article className={styles.containerPreview}>
                  <h1>{post.data.title}</h1>
                  <strong>{post.data.subtitle}</strong>

                  <footer>
                    <div>
                      <FiCalendar />
                      <span className={commonStyles.info}>
                        {post.first_publication_date}
                      </span>
                    </div>
                    <div>
                      <FiUser />
                      <span className={commonStyles.info}>
                        {post.data.author}
                      </span>
                    </div>
                  </footer>
                </article>
              </a>
            </Link>
          ))}
        {!!nextPage && (
          <button
            onClick={loadMostPost}
            className={styles.button}
            type="button"
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: [
        'posts.title',
        'posts.subtitle',
        'posts.author',
        'posts.first_publication_date',
      ],
      pageSize: 1,
    }
  );

  const nextPage = postsResponse.next_page;
  const postsPreview = postsResponse.results.map(post => {
    return {
      uid: post.slugs[0],
      first_publication_date: post.first_publication_date,
      data: post.data,
    };
  });
  const postsPagination = { results: postsPreview, next_page: nextPage };

  return {
    props: { postsPagination },
    revalidate: 60 * 30, // 30 min
  };
};
