import { Locale } from '@prisma/client';
import { DEFAULT_LOCALE, FALLBACK_LOCALES } from '../dto/locale-query.dto';

type Translation = {
    locale: Locale;
    [key: string]: unknown;
};

export function resolveTranslation<T extends Translation>(
    translations: T[] | undefined,
    requestedLocale?: Locale,
) {
    if (!translations?.length) return null;

    const fallbackChain = [
        requestedLocale ?? DEFAULT_LOCALE,
        ...FALLBACK_LOCALES,
    ];

    for (const locale of fallbackChain) {
        const translation = translations.find((item) => item.locale === locale);
        if (translation) return translation;
    }

    return translations[0] ?? null;
}

export function localizeEntity<T extends { translations?: Translation[] }>(
    entity: T,
    requestedLocale?: Locale,
) {
    if (!('translations' in entity)) return entity;

    return {
        ...entity,
        translation: resolveTranslation(entity.translations, requestedLocale),
    };
}

export function localizeEntities<T extends { translations?: Translation[] }>(
    entities: T[],
    requestedLocale?: Locale,
) {
    return entities.map((entity) => localizeEntity(entity, requestedLocale));
}
