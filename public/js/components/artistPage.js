import { parseTracks } from './tracks.js';
import { request, REQUESTED_ITEMS_FOR_PAGE_LIMIT, REQUESTED_ITEMS_FOR_PAGE_LIMIT_WITH_DUBLICATS } from '../request.js';
import { scrollToTop } from '../scroll.js';
import { getUnicElementsByName } from '../array.js';
import { parseContentItems } from './contentItems.js';
import { getMiddleColor, createImg } from '../img.js';
import { serverNoDataAlert, somethingWentWrongAlert } from '../alert.js';

/**
 * Запрашивает данные исполнителя с сервера Spotify.
 * @param {string} aristId Идентификатор исполнителя на сервере Spotify.
 * @returns {Promise<Array<object> | null>} Полученные данные.
 */

async function getArtistData(artistId) {
    const url = 'https://api.spotify.com/v1/artists/' + artistId;

    const response = await request(url);
    if (!response.ok) {
        return null;
    }

    const data = await response.json();
    return data;
}

/**
 * Запрашивает самые популярные треки исполнителя с сервера Spotify.
 * @param {string} aristId Идентификатор исполнителя на сервере Spotify.
 * @returns {Promise<Array<object> | null>} Полученные данные.
 */

async function getArtistsTopTracks(artistId) {
    const url = 'https://api.spotify.com/v1/artists/' + artistId + '/top-tracks?market=ES';

    const response = await request(url);
    if (!response.ok) {
        return null;
    }

    const data = await response.json();
    return data?.tracks;
}

/**
 * Запрашивает альбомы исполнителя с сервера Spotify.
 * @param {string} aristId Идентификатор исполнителя на сервере Spotify.
 * @returns {Promise<Array<object> | null>} Полученные данные.
 */

async function getArtistsAlbums(artistId) {
    const url = 'https://api.spotify.com/v1/artists/' + artistId + '/albums?' + 'include_groups=album&' + 'limit=' + REQUESTED_ITEMS_FOR_PAGE_LIMIT_WITH_DUBLICATS;

    const response = await request(url);
    if (!response.ok) {
        return null;
    }

    const data = await response.json();
    return data?.items;
}

/**
 * Запрашивает синглы и мини-альбомы исполнителя с сервера Spotify.
 * @param {string} aristId Идентификатор исполнителя на сервере Spotify.
 * @returns {Promise<Array<object> | null>} Полученные данные.
 */

async function getArtistsSingles(artistId) {
    const url = 'https://api.spotify.com/v1/artists/' + artistId + '/albums?' + 'include_groups=single&' + 'limit=' + REQUESTED_ITEMS_FOR_PAGE_LIMIT_WITH_DUBLICATS;

    const response = await request(url);
    if (!response.ok) {
        return null;
    }

    const data = await response.json();
    return data?.items;
}

/**
 * Запрашивает похожих исполнителей с сервера Spotify.
 * @param {string} aristId Идентификатор исполнителя на сервере Spotify.
 * @returns {Promise<Array<object> | null>} Полученные данные.
 */

async function getRelatedArtists(artistId) {
    const url = 'https://api.spotify.com/v1/artists/' + artistId + '/related-artists';

    const response = await request(url);
    if (!response.ok) {
        return null;
    }

    const data = await response.json();
    return data?.artists.slice(0, REQUESTED_ITEMS_FOR_PAGE_LIMIT);
}

/**
 * Устанавливает цвет шапки на странице исполнителя.
 * Цвет - средний цвет фотографии исполнителя.
 * @param {object} coverData Данные фотографии исполнителя. 
 */

function setHeaderColor(coverData) {
    const img = createImg(coverData);

    img.onload = () => {
        const middleColorRGBString = getMiddleColor(img);

        if (middleColorRGBString) {
            document.getElementsByClassName('artist-page__header')[0].style.backgroundColor = `rgb(${middleColorRGBString})`;
            document.getElementsByClassName('artist-page__popular-tracks')[0].style.backgroundColor = `rgb(${middleColorRGBString})`;
        }
    }
}

/**
 * Рендерит страницу исполнителя по переданным данным.
 * @param {object} artistData Данные исполнителя вида: имя(name: string), данные подписчиков(followers: { total: number }),
 * данные фотографий(images: Array<{ url: string, width: number, height: number }>).
 * @param {Array<object>} topTracksData Данные самых популярных треков исполнителя.
 * @param {Array<object>} albumsData Данные альбомов исполнителя.
 * @param {Array<object>} singlesData Данные синглов и мини-альбомов исполнителя.
 * @param {Array<object>} relatedArtistsData Данные похожих исполнителей.
 */

function setArtistPage(artistData, topTracksData, albumsData, singlesData, relatedArtistsData) {
    const root = document.getElementsByClassName('main')[0].children[1];
    root.className = 'artist-page';

    const artistPageHeader = document.createElement('section');
    artistPageHeader.className = 'artist-page__header';
    artistPageHeader.insertAdjacentHTML('beforeend', `
        <div class="artist-page__photo-wrapper">
            <img class="artist-page__photo" src="${artistData.images[0].url}" alt="${artistData.name}" />
        </div>
        <div class="artist-page__info">
            <div class="upprove-sign">
                <svg height="24px" width="24px" class="upprove-sign__icon">
                    <use xlink:href="imgs/icons/icons.svg#upprove"></use>
                </svg>
                <span class="upprove-sign__title">Подтвержденный исполнитель</span>
            </div>
            <h1 class="artist-page__name">${artistData.name}</h1>
            <div class="artist-page__listeners">${artistData.followers.total} подписчиков</div>
        </div>
    `);

    root.innerHTML = '';
    root.append(artistPageHeader);
    root.append(parseTracks(topTracksData, true, true));

    const unicAlbumsData = getUnicElementsByName(albumsData);

    const artistAlbums = document.createElement('div');
    artistAlbums.className = 'content-items__wrapper';
    artistAlbums.append(parseContentItems(unicAlbumsData, 'Альбомы'));

    root.append(artistAlbums);

    const unicSinglesData = getUnicElementsByName(singlesData);

    const artistsSingles = document.createElement('div');
    artistsSingles.className = 'content-items__wrapper';
    artistsSingles.append(parseContentItems(unicSinglesData, 'Синглы и EP'));

    root.append(artistsSingles);

    const relatedArtists = document.createElement('div');
    relatedArtists.className = 'content-items__wrapper';
    relatedArtists.append(parseContentItems(relatedArtistsData, 'Поклонникам также нравится'));

    root.append(relatedArtists);

    setHeaderColor(artistData.images[1]);
    scrollToTop();
}

/**
 * Запрашивает необходимые для страницы исполнителя данные.
 * Вызывает рендер страницы исполнителя.
 * @param {string} aristId Идентификатор артиста на сервере Spotify.
 */

export async function artistPage(artistId) {
    if (!artistId) {
        somethingWentWrongAlert();
        return;
    }

    const artistData = await getArtistData(artistId);
    const topTracksData = await getArtistsTopTracks(artistId);
    const albumsData = await getArtistsAlbums(artistId);
    const singlesData = await getArtistsSingles(artistId);
    const relatedArtistsData = await getRelatedArtists(artistId);

    if (!artistData || !topTracksData || !albumsData || !singlesData || !relatedArtistsData) {
        serverNoDataAlert();
        return;
    }

    setArtistPage(artistData, topTracksData, albumsData, singlesData, relatedArtistsData);
}