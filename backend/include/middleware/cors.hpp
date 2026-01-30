#pragma once

#include <crow.h>

namespace vicrow {

/**
 * @brief CORS Middleware for handling Cross-Origin Resource Sharing
 */
struct CORSMiddleware {
    struct context {};

    void before_handle(crow::request& req, crow::response& res, context& ctx) {
        // Handle preflight requests
        if (req.method == crow::HTTPMethod::OPTIONS) {
            res.code = 204;
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            res.add_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.add_header("Access-Control-Max-Age", "86400");
            res.end();
        }
    }

    void after_handle(crow::request& req, crow::response& res, context& ctx) {
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.add_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }
};

/**
 * @brief Add CORS headers to a response
 */
inline void addCorsHeaders(crow::response& res) {
    res.add_header("Access-Control-Allow-Origin", "*");
    res.add_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.add_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

} // namespace vicrow
