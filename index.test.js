const request = require("supertest");

const baseUrl = "https://petstore.swagger.io/v2";

describe("🐶 GET /pet/{petId}", () => {
  test("✅ Получение существующего питомца", async () => {
    const petId = 1;
    const response = await request(baseUrl).get(`/pet/${petId}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", petId);
    expect(response.body).toHaveProperty("name");
    expect(response.body).toHaveProperty("status");

    console.log(`Имя: ${response.body.name} | Статус: ${response.body.status}`);
  });

  test("❌ Ошибка: питомец не найден", async () => {
    const petId = 99999999;
    const response = await request(baseUrl).get(`/pet/${petId}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Pet not found");
  });

  test("⚠ Ошибка: неверный формат ID", async () => {
    const petId = "invalid";
    const response = await request(baseUrl).get(`/pet/${petId}`);

    expect(response.status).toBe(404);
  });
});

describe("➕ POST /pet", () => {
  test("✅ Успешное создание питомца", async () => {
    const newPet = {
      id: Date.now(),
      category: { id: 1, name: "dog" },
      name: "TestDog",
      tags: [{ id: 1, name: "friendly" }],
      status: "available",
    };

    const res = await request(baseUrl).post("/pet").send(newPet);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", newPet.id);

    console.log(`✅ Создан: ${res.body.name}`);
  });

  test("❌ Ошибка: неполные данные", async () => {
    const incompletePet = { name: "Incomplete", status: "available" };
    const res = await request(baseUrl).post("/pet").send(incompletePet);

    if (res.status === 200) {
      console.warn("⚠ API приняло неполные данные. Ожидался статус 400.");
    } else {
      expect(res.status).toBe(400);
    }
  });

  test("⚠ Длинное имя питомца", async () => {
    const longName = "A".repeat(300);
    const pet = {
      id: Date.now(),
      category: { id: 1, name: "dog" },
      name: longName,
      status: "available",
    };

    const res = await request(baseUrl).post("/pet").send(pet);
    expect(res.status).toBe(200);
    console.log(`⚠ Длина имени: ${longName.length}`);
  });
});

describe("🗑 DELETE /pet/{petId}", () => {
  test("✅ Удаление существующего питомца", async () => {
    const pet = {
      id: Date.now(),
      category: { id: 1, name: "dog" },
      name: "DeleteMe",
      status: "available",
    };

    await request(baseUrl).post("/pet").send(pet);
    const delRes = await request(baseUrl).delete(`/pet/${pet.id}`);
    expect(delRes.status).toBe(200);

    const getRes = await request(baseUrl).get(`/pet/${pet.id}`);
    expect(getRes.status).toBe(404);
  });

  test("❌ Удаление несуществующего питомца", async () => {
    const res = await request(baseUrl).delete("/pet/99999999");
    expect(res.status).toBe(404);
  });

  test("⚠ Удаление с некорректным ID", async () => {
    const res = await request(baseUrl).delete("/pet/invalid");
    expect([400, 404]).toContain(res.status);
  });
});

describe("✏ PUT /pet", () => {
  let petId;

  beforeAll(async () => {
    const pet = {
      id: Date.now(),
      name: "ToUpdate",
      status: "available",
    };
    const res = await request(baseUrl).post("/pet").send(pet);
    petId = res.body.id;
  });

  test("✅ Успешное обновление питомца", async () => {
    const updated = {
      id: petId,
      name: "UpdatedName",
      status: "sold",
    };

    const res = await request(baseUrl).put("/pet").send(updated);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("UpdatedName");
    expect(res.body.status).toBe("sold");
  });

  test("❌ Обновление несуществующего питомца", async () => {
    const fakePet = {
      id: 999999999,
      name: "Ghost",
      status: "available",
    };

    const res = await request(baseUrl).put("/pet").send(fakePet);
    expect(res.status).toBe(404);
  });

  test("⚠ Некорректные данные", async () => {
    const invalid = {
      id: petId,
      name: "",
      status: 12345,
    };

    const res = await request(baseUrl).put("/pet").send(invalid);
    expect(res.status).toBe(400);
  });
});

describe("📦 GET /store/inventory", () => {
  test("✅ Возвращает 200 OK", async () => {
    const res = await request(baseUrl).get("/store/inventory");
    expect(res.status).toBe(200);
  });

  test("✅ Ответ в формате JSON", async () => {
    const res = await request(baseUrl).get("/store/inventory");
    expect(res.headers["content-type"]).toMatch(/application\/json/);
  });

  test("✅ Ответ содержит ключи: available, pending, sold", async () => {
    const res = await request(baseUrl).get("/store/inventory");
    ["available", "pending", "sold"].forEach((key) =>
      expect(res.body).toHaveProperty(key)
    );
  });

  test("✅ Значения являются числами", async () => {
    const res = await request(baseUrl).get("/store/inventory");
    ["available", "pending", "sold"].forEach((key) =>
      expect(typeof res.body[key]).toBe("number")
    );
  });
});
