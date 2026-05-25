import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
} from 'class-validator';

export function HasUniqueLocales(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'hasUniqueLocales',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: unknown[]) {
                    if (!Array.isArray(value)) return true;

                    const locales = value
                        .map((item: any) => item?.locale)
                        .filter(Boolean);

                    return locales.length === new Set(locales).size;
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} contains duplicate locales`;
                },
            },
        });
    };
}
