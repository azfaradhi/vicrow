#pragma once

#include <crow.h>
#include "services/prisma_client.hpp"

namespace vicrow {
namespace routes {

/**
 * @brief Register health check routes
 */
template<typename App>
void registerHealthRoutes(App& app, PrismaClient& prisma) {
    CROW_ROUTE(app, "/api/health")
    ([&prisma]() -> crow::response {
        crow::json::wvalue response;
        response["status"] = "ok";
        response["message"] = "Vicrow Backend is running";
        response["timestamp"] = std::to_string(std::time(nullptr));
        response["database"] = prisma.isConnected() ? "connected" : "disconnected";
        
        crow::response res(response);
        res.add_header("Content-Type", "application/json");
        return res;
    });
}

} // namespace routes
} // namespace vicrow
