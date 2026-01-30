import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clean existing data
  console.log('Cleaning existing data...');
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tag.deleteMany();

  // Create tags
  console.log('Creating tags...');
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'Technology' } }),
    prisma.tag.create({ data: { name: 'Programming' } }),
    prisma.tag.create({ data: { name: 'Web Development' } }),
    prisma.tag.create({ data: { name: 'C++' } }),
    prisma.tag.create({ data: { name: 'React' } }),
  ]);

  // Create users with profiles
  console.log('Creating users...');
  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      name: 'John Doe',
      profile: {
        create: {
          bio: 'Full-stack developer passionate about C++ and React',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john'
        }
      }
    }
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      name: 'Jane Smith',
      profile: {
        create: {
          bio: 'Backend engineer specializing in high-performance systems',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane'
        }
      }
    }
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob Wilson',
      profile: {
        create: {
          bio: 'Frontend developer and UI/UX enthusiast',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob'
        }
      }
    }
  });

  // Create posts
  console.log('Creating posts...');
  const post1 = await prisma.post.create({
    data: {
      title: 'Getting Started with Vicrow Framework',
      content: `
# Introduction to Vicrow

Vicrow is a modern full-stack framework combining:
- **Vite + React** for the frontend
- **Crow C++** for high-performance backend
- **Prisma** for type-safe database access

## Why Vicrow?

The combination of these technologies provides:
1. Lightning-fast development experience
2. High-performance production builds
3. Type-safe database operations
      `,
      published: true,
      authorId: user1.id,
      tags: {
        connect: [
          { id: tags[0].id },
          { id: tags[2].id }
        ]
      }
    }
  });

  const post2 = await prisma.post.create({
    data: {
      title: 'Building REST APIs with Crow C++',
      content: `
# Crow C++ REST API Tutorial

Crow is a modern C++ micro web framework that makes building REST APIs easy and fast.

## Key Features
- Header-only library
- Modern C++17 support
- Middleware support
- JSON handling

## Example Route

\`\`\`cpp
CROW_ROUTE(app, "/api/users")
([&]() {
    auto users = prisma.findManyUsers();
    return crow::response(users.to_json());
});
\`\`\`
      `,
      published: true,
      authorId: user2.id,
      tags: {
        connect: [
          { id: tags[1].id },
          { id: tags[3].id }
        ]
      }
    }
  });

  // Create comments
  console.log('Creating comments...');
  await prisma.comment.createMany({
    data: [
      {
        content: 'Great introduction! Looking forward to more tutorials.',
        postId: post1.id
      },
      {
        content: 'This is exactly what I was looking for. Thanks!',
        postId: post1.id
      },
      {
        content: 'Crow seems really powerful. Nice example!',
        postId: post2.id
      }
    ]
  });

  console.log('\n✅ Seed completed successfully!');
  console.log(`
Created:
  - ${await prisma.user.count()} users
  - ${await prisma.profile.count()} profiles
  - ${await prisma.post.count()} posts
  - ${await prisma.comment.count()} comments
  - ${await prisma.tag.count()} tags
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
