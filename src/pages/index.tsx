import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { formatDate } from '../utils/formatDate';
import { PostPreview } from '../components/PostPreview';

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

export default function Home({
  results,
  next_page,
}: PostPagination): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(results);
  return (
    <main className={commonStyles.container}>
      {!!posts && posts.map(post => <PostPreview data={post} key={post.uid} />)}
    </main>
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
      first_publication_date: formatDate(new Date(post.first_publication_date)),
      data: post.data,
    };
  });

  return {
    props: { results: postsPreview, next_page: nextPage },
  };
};
