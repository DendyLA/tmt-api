import { PostsController } from './posts.controller';

describe('PostsController', () => {
    let postsService: any;
    let controller: PostsController;

    const req = { user: { sub: 'user-1' } };
    const post = {
        id: 'post-1',
        title: 'Post',
        slug: 'post',
        content: 'Post content',
    };

    beforeEach(() => {
        postsService = {
            findForCompanySite: jest.fn(),
            create: jest.fn(),
            findAllAdmin: jest.fn(),
            update: jest.fn(),
            publish: jest.fn(),
            remove: jest.fn(),
        };

        controller = new PostsController(postsService);
    });

    it('delegates public company posts lookup', async () => {
        postsService.findForCompanySite.mockResolvedValue([post]);

        await expect(controller.findForCompanySite('company')).resolves.toEqual([
            post,
        ]);
        expect(postsService.findForCompanySite).toHaveBeenCalledWith('company');
    });

    it('delegates create/update/publish/remove', async () => {
        postsService.create.mockResolvedValue(post);
        postsService.update.mockResolvedValue(post);
        postsService.publish.mockResolvedValue(post);
        postsService.remove.mockResolvedValue({ success: true });

        await expect(
            controller.create(req, {
                companyId: 'company-1',
                title: post.title,
                slug: post.slug,
                content: post.content,
            }),
        ).resolves.toEqual(post);
        await expect(controller.update(post.id, req, { title: post.title })).resolves.toEqual(post);
        await expect(controller.publish(post.id, req)).resolves.toEqual(post);
        await expect(controller.remove(post.id, req)).resolves.toEqual({
            success: true,
        });
    });
});
