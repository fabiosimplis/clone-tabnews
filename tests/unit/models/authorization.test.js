import { InternalServerError } from "infra/errors.js";
import authorization from "models/authorization.js";

describe("models/authorization.js", () => {
  describe(".can()", () => {
    test("Without `user`", () => {
      expect(() => {
        authorization.can();
      }).toThrow(InternalServerError);
    });

    test("Without `user.features`", () => {
      const createUser = {
        username: "UserWithoutFeatures",
      };
      expect(() => {
        authorization.can(createUser);
      }).toThrow(InternalServerError);
    });

    test("With unknow `feature`", () => {
      const createUser = {
        features: [],
      };
      expect(() => {
        authorization.can(createUser, "unknown:feature");
      }).toThrow(InternalServerError);
    });

    test("With valid `user` and know `feature`", () => {
      const createUser = {
        features: ["create:user"],
      };
      expect(authorization.can(createUser, "create:user")).toBe(true);
    });
  });

  describe(".filterOutput()", () => {
    test("Without `user`", () => {
      expect(() => {
        authorization.filterOutput();
      }).toThrow(InternalServerError);
    });

    test("Without `user.features`", () => {
      const createUser = {
        username: "UserWithoutFeatures",
      };
      expect(() => {
        authorization.filterOutput(createUser);
      }).toThrow(InternalServerError);
    });

    test("With unknow `feature`", () => {
      const createUser = {
        features: [],
      };
      expect(() => {
        authorization.filterOutput(createUser, "unknown:feature");
      }).toThrow(InternalServerError);
    });

    test("With valid `user`, know `feature` but no `resource`", () => {
      const createUser = {
        features: ["read:user"],
      };
      expect(() => {
        authorization.filterOutput(createUser, "read:user");
      }).toThrow(InternalServerError);
    });

    test("With valid `user`, know `feature` and `resource`", () => {
      const createUser = {
        features: ["read:user"],
      };

      const resource = {
        id: 1,
        username: "resource",
        features: ["read:user"],
        created_at: "2026-0101T00:00:00Z",
        updated_at: "2026-0101T00:00:00Z",
        email: "resource@resource.com",
        password: "resource",
      };

      const result = authorization.filterOutput(
        createUser,
        "read:user",
        resource,
      );

      expect(result).toEqual({
        id: 1,
        username: "resource",
        features: ["read:user"],
        created_at: "2026-0101T00:00:00Z",
        updated_at: "2026-0101T00:00:00Z",
      });
    });
  });
});
