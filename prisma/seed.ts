import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function seed() {
  const defaultAdmin = {
    username: "Sean Xiao",
    passwordHash:
      "$2a$10$0s3bG5mGz/LYVKChUIbqkOKmuZikjhgHNDRzj5iZtVSOVl6VieeTK",
    email: "zy05530@gmail.com",
    isAdmin: true,
  };
  await Promise.all([
    db.user.create({ data: defaultAdmin }),
    ...defaultBikes().map((bike) => {
      return db.bike.create({ data: bike });
    }),
  ]);
}

seed();

function defaultBikes() {
  return [
    {
      model: "Giant Stance 29",
      color: "Silver",
      location: "Auckland",
    },
    {
      model: "Giant Roam 4",
      color: "Blue",
      location: "Auckland",
    },
    {
      model: "Reid Urban S 700C",
      color: "White",
      location: "Wellington",
    },
    {
      model: "Rocky Mountain Slayer",
      color: "Yellow",
      location: "Christchurch",
    },
    {
      model: "Liv Rove 4 DD",
      color: "Red",
      location: "Christchurch",
    },
  ];
}
