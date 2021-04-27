import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { GetStaticPaths, GetStaticProps } from 'next';

import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { api } from '../../Components/services/api';
import { convertDurationToTimeString } from '../../Components/utils/convertDurationToTimeString';

import styles from './episode.module.scss';
import { usePlayer } from '../../contexts/PlayerContext';

type Episode = {
    id: string,
    title: string,
    thumbnail: string,
    description: string,
    members: string,
    duration: number,
    durationAsString: string,
    url: string,
    publishedAt: string,
};

type EpisodeProps = {
    episode: Episode;
}

export default function Episode({ episode }: EpisodeProps) {
    const { play } = usePlayer();

    return (
        <div className={styles.episode}>
            <Head>
                <title>{episode.title} | Brainsic</title>
            </Head>
            <div className={styles.thumbnailContainer}>
                <Link href="/">
                    <button type="button">
                        <img src="/arrow-left.svg" alt="Voltar" />
                    </button>
                </Link>
                <Image
                    width={700}
                    height={160}
                    src={episode.thumbnail}
                    objectFit="cover"
                />
                <button type="button" onClick={() => { play(episode) }}>
                    <img src="/play.svg" alt="Tocar episódio" />
                </button>
            </div>

            <header>
                <h1>{episode.title}</h1>
                <span>{episode.members}</span>
                <span>{episode.publishedAt}</span>
                <span>{episode.durationAsString}</span>
            </header>
            <div
                className={styles.description}
                dangerouslySetInnerHTML={{ __html: episode.description }}>
            </div>
        </div>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    const { data } = await api.get('api/musicas', {
        params: {
            _limit: 2,
            _sort: 'published_at',
            _order: 'desc',
        }
    });

    const paths = data.episodes.map(episode => {
        return {
            params: {
                slug: episode.id
            }
        }
    })
    return {
        paths,
        fallback: 'blocking'
    }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
    const { slug } = ctx.params;
    const { data } = await api.get(`/api/musicas`);

    const musica = await data.episodes.map(episode => {
        if (episode.id === slug) {
            return episode;
        }
    }).filter(notUndefined => notUndefined !== undefined)[0];
    console.log(musica);

    const episode = {
        id: musica.id,
        title: musica.title,
        thumbnail: musica.thumbnail,
        members: musica.members,
        publishedAt: format(parseISO(musica.published_at), 'd MMM yy', { locale: ptBR }),
        duration: Number(musica.file.duration),
        durationAsString: convertDurationToTimeString(Number(musica.file.duration)),
        description: musica.description,
        url: musica.file.url,
    }
    return {
        props: { episode },
        revalidate: 60 * 60 * 24, // 24 hours
    }
}