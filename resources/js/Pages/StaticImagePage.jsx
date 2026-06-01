import { Head } from '@inertiajs/react';

import PublicLayout from '@/Layouts/PublicLayout';

const imageModules = import.meta.glob('../../images/**/*.{png,jpg,jpeg,webp,svg}', {
    eager: true,
    query: '?url',
    import: 'default',
});

function resolveImage(path) {
    return imageModules[`../../images/${path}`];
}

export default function StaticImagePage({ auth, title, description, images }) {
    const resolvedImages = images
        .map((image) => ({
            key: image,
            src: resolveImage(image),
        }))
        .filter((image) => image.src);

    return (
        <PublicLayout auth={auth}>
            <Head title={title} />

            <section className="border-b border-toss-grey200 bg-toss-grey50">
                <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6 lg:px-8">
                    <p className="text-sm font-semibold text-toss-blue">Insurance Guide</p>
                    <h1 className="mt-3 text-3xl font-bold tracking-normal text-toss-grey900">{title}</h1>
                    {description && (
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-toss-grey600">{description}</p>
                    )}
                </div>
            </section>

            <section className="mx-auto max-w-5xl px-0 py-8 sm:px-6 lg:px-8">
                <div className="overflow-hidden bg-white">
                    {resolvedImages.map((image, index) => (
                        <img
                            key={image.key}
                            src={image.src}
                            alt={`${title} 안내 이미지 ${index + 1}`}
                            className="block h-auto w-full"
                            loading={index === 0 ? 'eager' : 'lazy'}
                        />
                    ))}
                </div>
            </section>
        </PublicLayout>
    );
}
