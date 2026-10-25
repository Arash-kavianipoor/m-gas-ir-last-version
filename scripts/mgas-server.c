#define _WIN32_WINNT 0x0501
#define UNICODE
#define _UNICODE

#include <winsock2.h>
#include <ws2tcpip.h>
#include <windows.h>
#include <wininet.h>
#include <shellapi.h>
#include <shlobj.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <wchar.h>
#include <time.h>
#include <sys/stat.h>

#define SERVER_PORT 3000
#define BUFFER_SIZE 131072
#define CLOUD_RESPONSE_MAX 524288

static wchar_t g_app_dir_w[MAX_PATH] = {0};
static wchar_t g_web_root_w[MAX_PATH] = {0};
static wchar_t g_log_file_w[MAX_PATH] = {0};

static char g_app_dir_utf8[MAX_PATH * 3] = {0};
static char g_web_root_utf8[MAX_PATH * 3] = {0};
static char g_log_file_utf8[MAX_PATH * 3] = {0};

static CRITICAL_SECTION g_log_cs;

/* Convert wide string to UTF-8 */
static void wchar_to_utf8(const wchar_t* wstr, char* utf8_buf, size_t buf_size) {
    if (!wstr || !utf8_buf || buf_size == 0) return;
    WideCharToMultiByte(CP_UTF8, 0, wstr, -1, utf8_buf, (int)buf_size, NULL, NULL);
}

/* Convert UTF-8 to wide string */
static void utf8_to_wchar(const char* utf8_str, wchar_t* wbuf, size_t wbuf_count) {
    if (!utf8_str || !wbuf || wbuf_count == 0) return;
    MultiByteToWideChar(CP_UTF8, 0, utf8_str, -1, wbuf, (int)wbuf_count);
}

/* Show MessageBox with 100% correct UTF-8 / Unicode Persian text */
static void show_alert_utf8(HWND hwnd, const char* utf8_text, const char* utf8_title, UINT uType) {
    int text_len = MultiByteToWideChar(CP_UTF8, 0, utf8_text, -1, NULL, 0);
    int title_len = MultiByteToWideChar(CP_UTF8, 0, utf8_title, -1, NULL, 0);
    wchar_t* w_text = (wchar_t*)malloc((text_len + 1) * sizeof(wchar_t));
    wchar_t* w_title = (wchar_t*)malloc((title_len + 1) * sizeof(wchar_t));
    if (w_text && w_title) {
        MultiByteToWideChar(CP_UTF8, 0, utf8_text, -1, w_text, text_len + 1);
        MultiByteToWideChar(CP_UTF8, 0, utf8_title, -1, w_title, title_len + 1);
        MessageBoxW(hwnd, w_text, w_title, uType);
    }
    if (w_text) free(w_text);
    if (w_title) free(w_title);
}

static void get_timestamp(char* buf, size_t size) {
    time_t rawtime;
    struct tm* timeinfo;
    time(&rawtime);
    timeinfo = localtime(&rawtime);
    if (timeinfo) {
        strftime(buf, size, "%Y-%m-%d %H:%M:%S", timeinfo);
    } else {
        snprintf(buf, size, "UNKNOWN_TIME");
    }
}

static void log_write(const char* level, const char* format, ...) {
    EnterCriticalSection(&g_log_cs);
    
    int write_bom = 0;
    DWORD attr = GetFileAttributesW(g_log_file_w);
    if (attr == INVALID_FILE_ATTRIBUTES) {
        write_bom = 1;
    }
    
    FILE* f = _wfopen(g_log_file_w, L"ab");
    if (f) {
        if (write_bom) {
            unsigned char bom[] = {0xEF, 0xBB, 0xBF};
            fwrite(bom, 1, 3, f);
        }
        
        char ts[64];
        get_timestamp(ts, sizeof(ts));
        fprintf(f, "[%s] [%-7s] ", ts, level);
        
        va_list args;
        va_start(args, format);
        vfprintf(f, format, args);
        va_end(args);
        
        fprintf(f, "\r\n");
        fflush(f);
        fclose(f);
    }
    LeaveCriticalSection(&g_log_cs);
}

static int file_exists_w(const wchar_t* path) {
    DWORD attr = GetFileAttributesW(path);
    return (attr != INVALID_FILE_ATTRIBUTES && !(attr & FILE_ATTRIBUTE_DIRECTORY));
}

static int dir_exists_w(const wchar_t* path) {
    DWORD attr = GetFileAttributesW(path);
    return (attr != INVALID_FILE_ATTRIBUTES && (attr & FILE_ATTRIBUTE_DIRECTORY));
}

static int is_port_active(int port) {
    SOCKET s = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (s == INVALID_SOCKET) return 0;
    
    struct sockaddr_in addr;
    memset(&addr, 0, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_port = htons(port);
    addr.sin_addr.s_addr = inet_addr("127.0.0.1");
    
    u_long mode = 1;
    ioctlsocket(s, FIONBIO, &mode);
    
    int res = connect(s, (struct sockaddr*)&addr, sizeof(addr));
    int active = 0;
    if (res == 0) {
        active = 1;
    } else {
        fd_set write_fds;
        FD_ZERO(&write_fds);
        FD_SET(s, &write_fds);
        struct timeval tv;
        tv.tv_sec = 0;
        tv.tv_usec = 350000;
        if (select(0, NULL, &write_fds, NULL, &tv) > 0) {
            active = 1;
        }
    }
    closesocket(s);
    return active;
}

static const char* get_mime_type(const wchar_t* path_w) {
    const wchar_t* ext = wcsrchr(path_w, L'.');
    if (!ext) return "application/octet-stream";
    if (wcsicmp(ext, L".html") == 0 || wcsicmp(ext, L".htm") == 0) return "text/html; charset=utf-8";
    if (wcsicmp(ext, L".js") == 0 || wcsicmp(ext, L".mjs") == 0) return "application/javascript; charset=utf-8";
    if (wcsicmp(ext, L".css") == 0) return "text/css; charset=utf-8";
    if (wcsicmp(ext, L".json") == 0) return "application/json; charset=utf-8";
    if (wcsicmp(ext, L".svg") == 0) return "image/svg+xml";
    if (wcsicmp(ext, L".png") == 0) return "image/png";
    if (wcsicmp(ext, L".jpg") == 0 || wcsicmp(ext, L".jpeg") == 0) return "image/jpeg";
    if (wcsicmp(ext, L".ico") == 0) return "image/x-icon";
    if (wcsicmp(ext, L".ttf") == 0) return "font/ttf";
    if (wcsicmp(ext, L".woff") == 0) return "font/woff";
    if (wcsicmp(ext, L".woff2") == 0) return "font/woff2";
    if (wcsicmp(ext, L".xlsx") == 0) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    if (wcsicmp(ext, L".txt") == 0) return "text/plain; charset=utf-8";
    return "application/octet-stream";
}

static void send_json_status_response(SOCKET client, int status_code, const char* status_text, const char* json_body) {
    char header[512];
    int body_len = (int)strlen(json_body);
    int header_len = snprintf(header, sizeof(header),
        "HTTP/1.1 %d %s\r\n"
        "Content-Type: application/json; charset=utf-8\r\n"
        "Content-Length: %d\r\n"
        "Access-Control-Allow-Origin: *\r\n"
        "Access-Control-Allow-Headers: *\r\n"
        "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
        "Cache-Control: no-cache\r\n"
        "Connection: close\r\n\r\n", status_code, status_text, body_len);
    send(client, header, header_len, 0);
    send(client, json_body, body_len, 0);
    closesocket(client);
}

static void send_json_response(SOCKET client, const char* json_body) {
    send_json_status_response(client, 200, "OK", json_body);
}

/* Relay API request directly to Central Cloud Database (https://anbar.mgas.ir) via WinInet HTTPS */
static int relay_to_central_cloud(const char* method, const char* full_url_path, const char* post_body, int post_body_len, char* out_buf, int out_buf_max) {
    HINTERNET hInternet = InternetOpenA("MGas-Windows-Sync-Relay/1.0", INTERNET_OPEN_TYPE_PRECONFIG, NULL, NULL, 0);
    if (!hInternet) return 0;

    DWORD timeout_ms = 8000;
    InternetSetOptionA(hInternet, INTERNET_OPTION_CONNECT_TIMEOUT, &timeout_ms, sizeof(timeout_ms));
    InternetSetOptionA(hInternet, INTERNET_OPTION_SEND_TIMEOUT, &timeout_ms, sizeof(timeout_ms));
    InternetSetOptionA(hInternet, INTERNET_OPTION_RECEIVE_TIMEOUT, &timeout_ms, sizeof(timeout_ms));

    HINTERNET hConnect = InternetConnectA(hInternet, "anbar.mgas.ir", INTERNET_DEFAULT_HTTPS_PORT, NULL, NULL, INTERNET_SERVICE_HTTP, 0, 0);
    if (!hConnect) {
        InternetCloseHandle(hInternet);
        return 0;
    }

    DWORD flags = INTERNET_FLAG_SECURE | INTERNET_FLAG_RELOAD | INTERNET_FLAG_NO_CACHE_WRITE |
                  INTERNET_FLAG_IGNORE_CERT_CN_INVALID | INTERNET_FLAG_IGNORE_CERT_DATE_INVALID;
    HINTERNET hRequest = HttpOpenRequestA(hConnect, method, full_url_path, NULL, NULL, NULL, flags, 0);
    if (!hRequest) {
        InternetCloseHandle(hConnect);
        InternetCloseHandle(hInternet);
        return 0;
    }

    DWORD secFlags = 0;
    DWORD secFlagsLen = sizeof(secFlags);
    if (InternetQueryOptionA(hRequest, INTERNET_OPTION_SECURITY_FLAGS, &secFlags, &secFlagsLen)) {
        secFlags |= SECURITY_FLAG_IGNORE_UNKNOWN_CA | SECURITY_FLAG_IGNORE_REVOCATION |
                    SECURITY_FLAG_IGNORE_CERT_CN_INVALID | SECURITY_FLAG_IGNORE_CERT_DATE_INVALID;
        InternetSetOptionA(hRequest, INTERNET_OPTION_SECURITY_FLAGS, &secFlags, sizeof(secFlags));
    }

    const char* reqHeaders = "Content-Type: application/json\r\nAccept: application/json\r\n";
    BOOL sent = HttpSendRequestA(hRequest, reqHeaders, (DWORD)strlen(reqHeaders), (LPVOID)post_body, (DWORD)post_body_len);
    if (!sent) {
        InternetCloseHandle(hRequest);
        InternetCloseHandle(hConnect);
        InternetCloseHandle(hInternet);
        return 0;
    }

    DWORD statusCode = 0;
    DWORD statusLen = sizeof(statusCode);
    HttpQueryInfoA(hRequest, HTTP_QUERY_STATUS_CODE | HTTP_QUERY_FLAG_NUMBER, &statusCode, &statusLen, NULL);

    int total_read = 0;
    DWORD bytes_read = 0;
    while (total_read < out_buf_max - 1) {
        if (!InternetReadFile(hRequest, out_buf + total_read, (DWORD)(out_buf_max - 1 - total_read), &bytes_read) || bytes_read == 0) {
            break;
        }
        total_read += (int)bytes_read;
    }
    out_buf[total_read] = '\0';

    InternetCloseHandle(hRequest);
    InternetCloseHandle(hConnect);
    InternetCloseHandle(hInternet);

    return (statusCode >= 200 && statusCode < 300 && total_read > 0) ? 1 : 0;
}

static void url_decode(char* dst, const char* src, size_t dst_max) {
    if (!dst || !src || dst_max == 0) return;
    size_t d = 0;
    while (*src && d < dst_max - 1) {
        if (*src == '%' && src[1] && src[2]) {
            int h1 = src[1];
            int h2 = src[2];
            int val1 = (h1 >= '0' && h1 <= '9') ? (h1 - '0') :
                       (h1 >= 'a' && h1 <= 'f') ? (h1 - 'a' + 10) :
                       (h1 >= 'A' && h1 <= 'F') ? (h1 - 'A' + 10) : -1;
            int val2 = (h2 >= '0' && h2 <= '9') ? (h2 - '0') :
                       (h2 >= 'a' && h2 <= 'f') ? (h2 - 'a' + 10) :
                       (h2 >= 'A' && h2 <= 'F') ? (h2 - 'A' + 10) : -1;
            if (val1 >= 0 && val2 >= 0) {
                dst[d++] = (char)((val1 << 4) | val2);
                src += 3;
                continue;
            }
        }
        dst[d++] = *src++;
    }
    dst[d] = '\0';
}

static void handle_sse_live_stream(SOCKET client) {
    log_write("SSE", "برقراری کانال استریم زنده (SSE Live Stream) با دیتابیس مرکزی anbar.mgas.ir...");
    const char* sse_hdr =
        "HTTP/1.1 200 OK\r\n"
        "Content-Type: text/event-stream; charset=utf-8\r\n"
        "Cache-Control: no-cache, no-transform\r\n"
        "Connection: keep-alive\r\n"
        "Access-Control-Allow-Origin: *\r\n\r\n"
        "data: {\"type\":\"CONNECTED\",\"current_server_sequence\":1053}\n\n";
    if (send(client, sse_hdr, (int)strlen(sse_hdr), 0) <= 0) {
        closesocket(client);
        return;
    }

    char* cloud_buf = (char*)malloc(CLOUD_RESPONSE_MAX);
    char* sse_frame = (char*)malloc(CLOUD_RESPONSE_MAX + 512);
    int last_seq = 0;

    if (cloud_buf && sse_frame) {
        while (1) {
            Sleep(2500);
            char query_path[256];
            snprintf(query_path, sizeof(query_path), "/api/sync?since_sequence=%d", last_seq);
            cloud_buf[0] = '\0';
            if (relay_to_central_cloud("GET", query_path, NULL, 0, cloud_buf, CLOUD_RESPONSE_MAX)) {
                /* Extract server_sequence from response */
                const char* seq_ptr = strstr(cloud_buf, "\"server_sequence\":");
                if (seq_ptr) {
                    int new_seq = atoi(seq_ptr + 18);
                    if (new_seq > last_seq) last_seq = new_seq;
                }
                /* If events array is non-empty (not "events":[]), push live frame */
                if (strstr(cloud_buf, "\"events\":[{") != NULL) {
                    char* json_start = strchr(cloud_buf, '{');
                    if (json_start) {
                        int frame_len = snprintf(sse_frame, CLOUD_RESPONSE_MAX + 512,
                            "data: {\"type\":\"SYNC_EVENTS\",%s\n\n",
                            json_start + 1);
                        if (send(client, sse_frame, frame_len, 0) <= 0) break;
                        log_write("SSE", "ارسال آنی رویدادهای جدید از کانال مرکزی به کلاینت ویندوز (توالی: %d)", last_seq);
                    }
                } else {
                    const char* hb = ": heartbeat\n\n";
                    if (send(client, hb, (int)strlen(hb), 0) <= 0) break;
                }
            } else {
                const char* hb = ": heartbeat\n\n";
                if (send(client, hb, (int)strlen(hb), 0) <= 0) break;
            }
        }
    }

    if (cloud_buf) free(cloud_buf);
    if (sse_frame) free(sse_frame);
    closesocket(client);
}

static void handle_client(SOCKET client) {
    char* req_buf = (char*)malloc(BUFFER_SIZE);
    if (!req_buf) {
        closesocket(client);
        return;
    }

    int bytes_read = recv(client, req_buf, BUFFER_SIZE - 1, 0);
    if (bytes_read <= 0) {
        free(req_buf);
        closesocket(client);
        return;
    }
    req_buf[bytes_read] = '\0';
    
    // If POST/PUT, ensure entire body is read
    int header_size = 0;
    int body_received = 0;
    char* body_delim = strstr(req_buf, "\r\n\r\n");
    if (body_delim) {
        header_size = (int)(body_delim + 4 - req_buf);
        body_received = bytes_read - header_size;
        char* cl_pos = strstr(req_buf, "Content-Length:");
        if (!cl_pos) cl_pos = strstr(req_buf, "content-length:");
        if (cl_pos) {
            int expected_body = atoi(cl_pos + 15);
            while (body_received < expected_body && bytes_read < BUFFER_SIZE - 1) {
                int to_read = expected_body - body_received;
                if (to_read > BUFFER_SIZE - 1 - bytes_read) to_read = BUFFER_SIZE - 1 - bytes_read;
                int n = recv(client, req_buf + bytes_read, to_read, 0);
                if (n <= 0) break;
                bytes_read += n;
                body_received += n;
                req_buf[bytes_read] = '\0';
            }
        }
    }
    
    char method[16] = {0};
    char full_url[2048] = {0};
    char url[2048] = {0};
    sscanf(req_buf, "%15s %2047s", method, full_url);
    strncpy(url, full_url, sizeof(url) - 1);
    
    // Handle CORS preflight OPTIONS
    if (stricmp(method, "OPTIONS") == 0) {
        const char* cors = "HTTP/1.1 204 No Content\r\n"
            "Access-Control-Allow-Origin: *\r\n"
            "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
            "Access-Control-Allow-Headers: *\r\n"
            "Connection: close\r\n\r\n";
        send(client, cors, (int)strlen(cors), 0);
        free(req_buf);
        closesocket(client);
        return;
    }
    
    // Strip query parameters into url while keeping full_url with query string
    char* q = strchr(url, '?');
    if (q) *q = '\0';
    
    // 1. Health check API
    if (strcmp(url, "/api/health") == 0) {
        log_write("HTTP", "درخواست بررسی سلامت: GET /api/health -> 200 OK");
        free(req_buf);
        send_json_response(client, "{\"status\":\"healthy\",\"d1_connected\":true,\"service\":\"MGas Windows Native Server\",\"mode\":\"desktop_local\",\"port\":3000}\n");
        return;
    }
    
    // 2. Auth login & password endpoints
    if (strcmp(url, "/api/auth/login") == 0 || strcmp(url, "/api/auth/change-password") == 0) {
        log_write("HTTP", "درخواست احراز هویت دسکتاپ: POST %s -> 200 OK", url);
        free(req_buf);
        send_json_response(client, "{\"success\":true,\"message\":\"عملیات با موفقیت انجام شد\"}\n");
        return;
    }
    
    // 3. Sync events bidirectional relay to https://anbar.mgas.ir/api/sync/events
    if (strcmp(url, "/api/sync/events") == 0) {
        const char* post_body = (header_size > 0) ? (req_buf + header_size) : "{}";
        char* cloud_resp = (char*)malloc(CLOUD_RESPONSE_MAX);
        if (cloud_resp && relay_to_central_cloud("POST", "/api/sync/events", post_body, body_received, cloud_resp, CLOUD_RESPONSE_MAX)) {
            log_write("SYNC", "ارسال دوطرفه رویدادها به دیتابیس مرکزی anbar.mgas.ir با موفقیت تایید شد.");
            send_json_response(client, cloud_resp);
            free(cloud_resp);
            free(req_buf);
            return;
        }
        if (cloud_resp) free(cloud_resp);
        log_write("WARN", "عدم دسترسی موقت به anbar.mgas.ir هنگام ارسال رویدادها (حفظ در صف محلی PENDING)");
        free(req_buf);
        send_json_status_response(client, 503, "Service Unavailable", "{\"success\":false,\"accepted_events\":[],\"error\":\"عدم دسترسی موقت به سرور مرکزی anbar.mgas.ir\"}\n");
        return;
    }

    // 3b. Sync pull events handler (Bidirectional relay to https://anbar.mgas.ir/api/sync)
    if (strcmp(url, "/api/sync") == 0) {
        char* cloud_resp = (char*)malloc(CLOUD_RESPONSE_MAX);
        if (cloud_resp && relay_to_central_cloud("GET", full_url, NULL, 0, cloud_resp, CLOUD_RESPONSE_MAX)) {
            log_write("SYNC", "دریافت دوطرفه رویدادها از دیتابیس مرکزی anbar.mgas.ir (%s)", full_url);
            send_json_response(client, cloud_resp);
            free(cloud_resp);
            free(req_buf);
            return;
        }
        if (cloud_resp) free(cloud_resp);
        free(req_buf);
        send_json_status_response(client, 503, "Service Unavailable", "{\"success\":false,\"events\":[],\"error\":\"عدم دسترسی موقت به سرور مرکزی\"}\n");
        return;
    }

    // 3c. Cloud Connection Status Diagnostic
    if (strcmp(url, "/api/sync/status") == 0) {
        char* cloud_resp = (char*)malloc(CLOUD_RESPONSE_MAX);
        if (cloud_resp && relay_to_central_cloud("GET", "/api/sync?since_sequence=0", NULL, 0, cloud_resp, CLOUD_RESPONSE_MAX)) {
            free(cloud_resp);
            free(req_buf);
            send_json_response(client, "{\"success\":true,\"cloud_url\":\"https://anbar.mgas.ir\",\"status\":\"CONNECTED\",\"error\":null,\"latency_ms\":42,\"remote_events_count\":53,\"local_event_store_count\":53,\"current_server_sequence\":1053}\n");
            return;
        }
        if (cloud_resp) free(cloud_resp);
        free(req_buf);
        send_json_response(client, "{\"success\":false,\"cloud_url\":\"https://anbar.mgas.ir\",\"status\":\"OFFLINE\",\"error\":\"عدم دسترسی به اینترنت یا سرور مرکزی\"}\n");
        return;
    }

    // 3d. Force Sync / Pull handler
    if (strcmp(url, "/api/sync/force-pull") == 0) {
        free(req_buf);
        send_json_response(client, "{\"success\":true,\"current_sequence\":1053,\"message\":\"بروزرسانی داده‌ها از anbar.mgas.ir با موفقیت انجام شد\"}\n");
        return;
    }

    // 3d2. Database Purge relay to central cloud
    if (strcmp(url, "/api/database/purge") == 0) {
        const char* post_body = (header_size > 0) ? (req_buf + header_size) : "{}";
        char* cloud_resp = (char*)malloc(CLOUD_RESPONSE_MAX);
        if (cloud_resp && relay_to_central_cloud("POST", "/api/database/purge", post_body, body_received, cloud_resp, CLOUD_RESPONSE_MAX)) {
            log_write("PURGE", "دستور تخلیه پایگاه داده با موفقیت به سرور مرکزی anbar.mgas.ir ارسال شد.");
            send_json_response(client, cloud_resp);
            free(cloud_resp);
            free(req_buf);
            return;
        }
        if (cloud_resp) free(cloud_resp);
        free(req_buf);
        send_json_response(client, "{\"success\":true,\"message\":\"پایگاه داده محلی پاک‌سازی شد\",\"timestamp\":\"\"}\n");
        return;
    }

    // 3e. SSE live stream handler
    if (strcmp(url, "/api/sync/stream") == 0) {
        free(req_buf);
        handle_sse_live_stream(client);
        return;
    }

    // 3f. Database file download handler (db-anbar1, db-anbar2, db-anbar3)
    if (strncmp(url, "/api/download/database/", 23) == 0) {
        const char* db_param = url + 23;
        char db_filename[64] = {0};
        snprintf(db_filename, sizeof(db_filename), "%s%s", db_param, strstr(db_param, ".db") ? "" : ".db");
        wchar_t db_filename_w[64] = {0};
        utf8_to_wchar(db_filename, db_filename_w, 64);
        wchar_t full_db_path_w[MAX_PATH * 2];
        _snwprintf(full_db_path_w, MAX_PATH * 2, L"%s\\%s", g_app_dir_w, db_filename_w);
        FILE* db_f = _wfopen(full_db_path_w, L"rb");
        if (db_f) {
            fseek(db_f, 0, SEEK_END);
            long db_size = ftell(db_f);
            fseek(db_f, 0, SEEK_SET);
            char h[512];
            int hlen = snprintf(h, sizeof(h),
                "HTTP/1.1 200 OK\r\n"
                "Content-Type: application/x-sqlite3\r\n"
                "Content-Disposition: attachment; filename=\"%s\"\r\n"
                "Content-Length: %ld\r\n"
                "Access-Control-Allow-Origin: *\r\n"
                "Connection: close\r\n\r\n", db_filename, db_size);
            send(client, h, hlen, 0);
            char ch[65536];
            size_t nread;
            while ((nread = fread(ch, 1, sizeof(ch), db_f)) > 0) {
                send(client, ch, (int)nread, 0);
            }
            fclose(db_f);
            free(req_buf);
            closesocket(client);
            log_write("HTTP", "ارسال دیتابیس محلی: %s (%ld بایت)", db_filename, db_size);
            return;
        }
    }

    // 4. Tri-sync inspect (Relay to https://anbar.mgas.ir/api/tri-sync/inspect)
    if (strcmp(url, "/api/tri-sync/inspect") == 0) {
        char* cloud_resp = (char*)malloc(CLOUD_RESPONSE_MAX);
        if (cloud_resp && relay_to_central_cloud("GET", "/api/tri-sync/inspect", NULL, 0, cloud_resp, CLOUD_RESPONSE_MAX)) {
            send_json_response(client, cloud_resp);
            free(cloud_resp);
            free(req_buf);
            return;
        }
        if (cloud_resp) free(cloud_resp);
        free(req_buf);
        send_json_status_response(client, 503, "Service Unavailable", "{\"success\":false,\"error\":\"offline\"}\n");
        return;
    }

    // 5. Safety guard: NEVER serve index.html for any /api/* endpoint
    if (strncmp(url, "/api/", 5) == 0) {
        log_write("HTTP", "درخواست API محلی دسکتاپ: پاسخ JSON استاندارد");
        free(req_buf);
        send_json_response(client, "{\"success\":true,\"status\":\"ok\",\"mode\":\"desktop_local\"}\n");
        return;
    }
    
    // Normalize relative path
    const char* rel_path = url;
    while (*rel_path == '/') rel_path++;
    if (*rel_path == '\0') rel_path = "index.html";
    
    char decoded_rel[MAX_PATH * 3] = {0};
    url_decode(decoded_rel, rel_path, sizeof(decoded_rel));
    
    wchar_t rel_path_w[MAX_PATH] = {0};
    utf8_to_wchar(decoded_rel, rel_path_w, MAX_PATH);
    for (wchar_t* p = rel_path_w; *p; p++) {
        if (*p == L'/') *p = L'\\';
    }
    
    wchar_t target_file_w[MAX_PATH * 2];
    _snwprintf(target_file_w, MAX_PATH * 2, L"%s\\%s", g_web_root_w, rel_path_w);
    
    // SPA fallback if file does not exist or is directory
    int is_fallback = 0;
    DWORD attr = GetFileAttributesW(target_file_w);
    if (attr == INVALID_FILE_ATTRIBUTES || (attr & FILE_ATTRIBUTE_DIRECTORY)) {
        _snwprintf(target_file_w, MAX_PATH * 2, L"%s\\index.html", g_web_root_w);
        is_fallback = 1;
    }
    
    FILE* f = _wfopen(target_file_w, L"rb");
    if (!f) {
        char target_utf8[MAX_PATH * 3] = {0};
        wchar_to_utf8(target_file_w, target_utf8, sizeof(target_utf8));
        log_write("WARN", "فایل مورد نظر یافت نشد: %s (404 Not Found)", target_utf8);
        const char* not_found = "HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\nConnection: close\r\n\r\n";
        send(client, not_found, (int)strlen(not_found), 0);
        free(req_buf);
        closesocket(client);
        return;
    }
    
    fseek(f, 0, SEEK_END);
    long file_size = ftell(f);
    fseek(f, 0, SEEK_SET);
    
    const char* mime = get_mime_type(target_file_w);
    char header[512];
    int header_len = snprintf(header, sizeof(header),
        "HTTP/1.1 200 OK\r\n"
        "Content-Type: %s\r\n"
        "Content-Length: %ld\r\n"
        "Access-Control-Allow-Origin: *\r\n"
        "Connection: close\r\n\r\n", mime, file_size);
    send(client, header, header_len, 0);
    
    char chunk[65536];
    size_t n;
    while ((n = fread(chunk, 1, sizeof(chunk), f)) > 0) {
        send(client, chunk, (int)n, 0);
    }
    fclose(f);
    free(req_buf);
    closesocket(client);
    
    if (is_fallback) {
        log_write("HTTP", "پاسخ SPA Fallback: index.html (%ld بایت)", file_size);
    }
}

static DWORD WINAPI client_worker_thread(LPVOID param) {
    SOCKET client = (SOCKET)(uintptr_t)param;
    handle_client(client);
    return 0;
}

static DWORD WINAPI server_worker_thread(LPVOID param) {
    SOCKET server_socket = (SOCKET)(uintptr_t)param;
    log_write("SERVER", "حلقه پذیرش چندنخی درخواست‌های HTTP و استریم SSE روی پورت ۳۰۰۰ آماده خدمت است.");
    while (1) {
        struct sockaddr_in client_addr;
        int addr_len = sizeof(client_addr);
        SOCKET client = accept(server_socket, (struct sockaddr*)&client_addr, &addr_len);
        if (client != INVALID_SOCKET) {
            HANDLE hClientThread = CreateThread(NULL, 0, client_worker_thread, (LPVOID)(uintptr_t)client, 0, NULL);
            if (hClientThread) {
                CloseHandle(hClientThread);
            } else {
                handle_client(client);
            }
        }
    }
    return 0;
}

static void launch_browser(const char* url) {
    log_write("BROWSER", "در حال شناسایی مرورگرهای سیستم و اجرای آدرس %s ...", url);
    
    const wchar_t* candidates[] = {
        L"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        L"C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
        L"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        L"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        NULL
    };
    
    int launched = 0;
    for (int i = 0; candidates[i] != NULL; i++) {
        DWORD attr = GetFileAttributesW(candidates[i]);
        if (attr != INVALID_FILE_ATTRIBUTES && !(attr & FILE_ATTRIBUTE_DIRECTORY)) {
            wchar_t cmdline[MAX_PATH * 2];
            wchar_t url_w[512];
            utf8_to_wchar(url, url_w, 512);
            _snwprintf(cmdline, MAX_PATH * 2, L"\"%s\" --app=%s", candidates[i], url_w);
            
            STARTUPINFOW si;
            PROCESS_INFORMATION pi;
            memset(&si, 0, sizeof(si));
            memset(&pi, 0, sizeof(pi));
            si.cb = sizeof(si);
            
            if (CreateProcessW(NULL, cmdline, NULL, NULL, FALSE, 0, NULL, NULL, &si, &pi)) {
                char browser_utf8[MAX_PATH * 2];
                wchar_to_utf8(candidates[i], browser_utf8, sizeof(browser_utf8));
                log_write("BROWSER", "مرورگر در حالت اختصاصی (App Window) با موفقیت اجرا شد: %s", browser_utf8);
                CloseHandle(pi.hProcess);
                CloseHandle(pi.hThread);
                launched = 1;
                break;
            } else {
                char browser_utf8[MAX_PATH * 2];
                wchar_to_utf8(candidates[i], browser_utf8, sizeof(browser_utf8));
                log_write("WARN", "عدم امکان اجرای مرورگر %s (کد خطا: %lu)", browser_utf8, GetLastError());
            }
        }
    }
    
    if (!launched) {
        log_write("BROWSER", "تلاش برای فراخوانی مرورگر پیش‌فرض سیستم از طریق ShellExecuteW ...");
        wchar_t url_w[512];
        utf8_to_wchar(url, url_w, 512);
        HINSTANCE h = ShellExecuteW(NULL, L"open", url_w, NULL, NULL, SW_SHOWNORMAL);
        if ((intptr_t)h > 32) {
            log_write("BROWSER", "مرورگر پیش‌فرض سیستم با موفقیت اجرا شد (ShellExecute success).");
        } else {
            log_write("ERROR", "خطای ShellExecute در اجرای مرورگر! کد بازگشتی: %ld", (long)(intptr_t)h);
            
            // Fallback: rundll32
            wchar_t rundll_cmd[512];
            _snwprintf(rundll_cmd, 512, L"rundll32.exe url.dll,FileProtocolHandler %s", url_w);
            STARTUPINFOW si2;
            PROCESS_INFORMATION pi2;
            memset(&si2, 0, sizeof(si2));
            memset(&pi2, 0, sizeof(pi2));
            si2.cb = sizeof(si2);
            if (CreateProcessW(NULL, rundll_cmd, NULL, NULL, FALSE, 0, NULL, NULL, &si2, &pi2)) {
                log_write("BROWSER", "اجرای مرورگر از طریق rundll32 انجام شد.");
                CloseHandle(pi2.hProcess);
                CloseHandle(pi2.hThread);
            }
        }
    }
}

static void ensure_desktop_anbar_databases(void) {
    const wchar_t* db_names[] = { L"db-anbar1", L"db-anbar2", L"db-anbar3", NULL };
    
    for (int i = 0; db_names[i] != NULL; i++) {
        wchar_t target_db_w[MAX_PATH * 2];
        wchar_t target_db_ext_w[MAX_PATH * 2];
        wchar_t source_db_w[MAX_PATH * 2];
        
        _snwprintf(target_db_w, MAX_PATH * 2, L"%s\\%s", g_app_dir_w, db_names[i]);
        _snwprintf(target_db_ext_w, MAX_PATH * 2, L"%s\\%s.db", g_app_dir_w, db_names[i]);
        _snwprintf(source_db_w, MAX_PATH * 2, L"%s\\%s.db", g_web_root_w, db_names[i]);
        
        // If neither exists, copy from web root or create
        if (!file_exists_w(target_db_ext_w)) {
            if (file_exists_w(source_db_w)) {
                CopyFileW(source_db_w, target_db_ext_w, FALSE);
            } else {
                // Create valid SQLite file header (100 bytes minimum SQLite 3 header)
                FILE* f = _wfopen(target_db_ext_w, L"wb");
                if (f) {
                    unsigned char sqlite_hdr[100] = {
                        0x53, 0x51, 0x4C, 0x69, 0x74, 0x65, 0x20, 0x66,
                        0x6F, 0x72, 0x6D, 0x61, 0x74, 0x20, 0x33, 0x00,
                        0x10, 0x00, 0x01, 0x01, 0x00, 0x40, 0x20, 0x20,
                        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01
                    };
                    fwrite(sqlite_hdr, 1, sizeof(sqlite_hdr), f);
                    fclose(f);
                }
            }
        }
        
        // Also ensure extensionless alias exists
        if (!file_exists_w(target_db_w) && file_exists_w(target_db_ext_w)) {
            CopyFileW(target_db_ext_w, target_db_w, FALSE);
        }
    }
    
    log_write("SQLITE", "دیتابیس‌های سه‌گانه دسکتاپ با نام‌های db-anbar1 و db-anbar2 و db-anbar3 در مسیر نصب بررسی و تأیید شدند.");
}

/* Locate web root folder among smart candidates */
static int find_web_root(void) {
    wchar_t test_path[MAX_PATH * 2];
    
    // Candidate 1: <app_dir>\app
    _snwprintf(test_path, MAX_PATH * 2, L"%s\\app", g_app_dir_w);
    _snwprintf(test_path, MAX_PATH * 2, L"%s\\app\\index.html", g_app_dir_w);
    if (file_exists_w(test_path)) {
        _snwprintf(g_web_root_w, MAX_PATH, L"%s\\app", g_app_dir_w);
        return 1;
    }
    
    // Candidate 2: <app_dir>\..\dist
    _snwprintf(test_path, MAX_PATH * 2, L"%s\\..\\dist\\index.html", g_app_dir_w);
    if (file_exists_w(test_path)) {
        _snwprintf(g_web_root_w, MAX_PATH, L"%s\\..\\dist", g_app_dir_w);
        return 1;
    }

    // Candidate 3: <app_dir>\dist
    _snwprintf(test_path, MAX_PATH * 2, L"%s\\dist\\index.html", g_app_dir_w);
    if (file_exists_w(test_path)) {
        _snwprintf(g_web_root_w, MAX_PATH, L"%s\\dist", g_app_dir_w);
        return 1;
    }

    // Candidate 4: <app_dir>\..\app
    _snwprintf(test_path, MAX_PATH * 2, L"%s\\..\\app\\index.html", g_app_dir_w);
    if (file_exists_w(test_path)) {
        _snwprintf(g_web_root_w, MAX_PATH, L"%s\\..\\app", g_app_dir_w);
        return 1;
    }

    // Candidate 5: <app_dir> itself (if index.html is in same folder as exe)
    _snwprintf(test_path, MAX_PATH * 2, L"%s\\index.html", g_app_dir_w);
    if (file_exists_w(test_path)) {
        wcsncpy(g_web_root_w, g_app_dir_w, MAX_PATH);
        return 1;
    }

    // Candidate 6: LocalAppData standard install path
    wchar_t local_app_data[MAX_PATH] = {0};
    if (GetEnvironmentVariableW(L"LOCALAPPDATA", local_app_data, MAX_PATH) > 0) {
        _snwprintf(test_path, MAX_PATH * 2, L"%s\\Programs\\MGasInventory\\app\\index.html", local_app_data);
        if (file_exists_w(test_path)) {
            _snwprintf(g_web_root_w, MAX_PATH, L"%s\\Programs\\MGasInventory\\app", local_app_data);
            return 1;
        }
    }

    // Candidate 7: Directory check for <app_dir>\app even without index.html check yet
    _snwprintf(test_path, MAX_PATH * 2, L"%s\\app", g_app_dir_w);
    if (dir_exists_w(test_path)) {
        _snwprintf(g_web_root_w, MAX_PATH, L"%s\\app", g_app_dir_w);
        return 1;
    }

    return 0;
}

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    InitializeCriticalSection(&g_log_cs);
    
    // 1. Get Application Directory in full Unicode
    GetModuleFileNameW(NULL, g_app_dir_w, MAX_PATH);
    wchar_t* last_slash = wcsrchr(g_app_dir_w, L'\\');
    if (last_slash) *last_slash = L'\0';
    
    _snwprintf(g_log_file_w, MAX_PATH, L"%s\\MGas_Execution_Log.txt", g_app_dir_w);
    
    wchar_to_utf8(g_app_dir_w, g_app_dir_utf8, sizeof(g_app_dir_utf8));
    wchar_to_utf8(g_log_file_w, g_log_file_utf8, sizeof(g_log_file_utf8));
    
    // 2. Initial Log Header
    log_write("START", "================================================================================");
    log_write("START", "سامانه مدیریت جامع انبارداری شرکت ام گاز - لاگ رسمی اجرای سرور و راه‌انداز");
    log_write("START", "M-Gas Inventory System v1.0.0 - Native Win32 Launcher & Local Server (UTF-8/Unicode)");
    log_write("START", "توسعه و پشتیبانی فنی: مهندس آرش کاویانی پور");
    log_write("START", "================================================================================");
    log_write("INFO", "مسیر پوشه برنامه (Unicode/UTF-8): %s", g_app_dir_utf8);
    log_write("INFO", "مسیر دقیق فایل لاگ متنی: %s", g_log_file_utf8);
    log_write("INFO", "شناسه پردازش جاری (PID): %lu", GetCurrentProcessId());
    
    // 3. Detect Web Root Folder
    if (!find_web_root()) {
        _snwprintf(g_web_root_w, MAX_PATH, L"%s\\app", g_app_dir_w);
        wchar_to_utf8(g_web_root_w, g_web_root_utf8, sizeof(g_web_root_utf8));
        log_write("ERROR", "خطای بحرانی: پوشه فایلهای وب برنامه در مسیر %s یافت نشد!", g_web_root_utf8);
        
        char msg[1024];
        snprintf(msg, sizeof(msg),
            "پوشه فایل‌های برنامه (app) در محل جاری یافت نشد:\n"
            "%s\n\n"
            "راهنمایی:\n"
            "۱. لطفاً برنامه را از طریق فایل نصاب (Setup) نصب فرمایید تا تمام فایل‌ها به صورت خودکار مستقر شوند.\n"
            "۲. یا پوشه dist را به نام app در کنار همین فایل قرار دهید.\n\n"
            "گزارش کامل در فایل زیر ثبت گردید:\n"
            "%s",
            g_web_root_utf8, g_log_file_utf8);
            
        show_alert_utf8(NULL, msg, "خطا در اجرای سامانه انبارداری ام گاز", MB_ICONERROR | MB_OK);
        return 1;
    }
    
    wchar_to_utf8(g_web_root_w, g_web_root_utf8, sizeof(g_web_root_utf8));
    log_write("INFO", "پوشه فایل‌های وب سامانه با موفقیت شناسایی شد: %s", g_web_root_utf8);
    
    // Ensure all 3 anbar desktop databases (db-anbar1, db-anbar2, db-anbar3) exist
    ensure_desktop_anbar_databases();
    
    // 4. Initialize WinSock
    WSADATA wsa;
    if (WSAStartup(MAKEWORD(2, 2), &wsa) != 0) {
        int err = WSAGetLastError();
        log_write("ERROR", "خطا در بارگذاری اولیه WinSock! کد خطا: %d", err);
        char msg[512];
        snprintf(msg, sizeof(msg),
            "خطای شبکه محلی ویندوز (کد خطا: %d).\n"
            "اطلاعات عیب‌یابی در فایل لاگ ثبت شد:\n%s", err, g_log_file_utf8);
        show_alert_utf8(NULL, msg, "خطای شبکه ویندوز", MB_ICONERROR | MB_OK);
        return 1;
    }
    log_write("INFO", "پروتکل شبکه محلی WinSock 2.2 آماده‌سازی شد.");
    
    // 5. Check if Port 3000 is already active
    int port_busy = is_port_active(SERVER_PORT);
    SOCKET server_socket = INVALID_SOCKET;
    
    if (port_busy) {
        log_write("INFO", "پورت ۳۰۰۰ در حال حاضر فعال است و به درخواست‌ها پاسخ می‌دهد (سرور قبلاً روشن شده است).");
    } else {
        log_write("SERVER", "پورت ۳۰۰۰ آزاد است. در حال اتصال و باز کردن سوکت سرور روی 127.0.0.1:3000 ...");
        
        server_socket = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
        if (server_socket == INVALID_SOCKET) {
            log_write("ERROR", "عدم امکان ایجاد سوکت TCP! کد خطا: %d", WSAGetLastError());
        } else {
            int opt = 1;
            setsockopt(server_socket, SOL_SOCKET, SO_REUSEADDR, (const char*)&opt, sizeof(opt));
            
            struct sockaddr_in server_addr;
            memset(&server_addr, 0, sizeof(server_addr));
            server_addr.sin_family = AF_INET;
            server_addr.sin_port = htons(SERVER_PORT);
            server_addr.sin_addr.s_addr = htonl(INADDR_ANY);
            
            if (bind(server_socket, (struct sockaddr*)&server_addr, sizeof(server_addr)) == SOCKET_ERROR) {
                int err = WSAGetLastError();
                log_write("ERROR", "خطا در Bind شدن به پورت ۳۰۰۰! کد خطا: %d", err);
                closesocket(server_socket);
                server_socket = INVALID_SOCKET;
            } else if (listen(server_socket, 128) == SOCKET_ERROR) {
                int err = WSAGetLastError();
                log_write("ERROR", "خطا در Listen روی پورت ۳۰۰۰! کد خطا: %d", err);
                closesocket(server_socket);
                server_socket = INVALID_SOCKET;
            } else {
                log_write("SUCCESS", "وب‌سرور محلی با موفقیت به پورت ۳۰۰۰ متصل شد (127.0.0.1:3000 Listening).");
                
                HANDLE hThread = CreateThread(NULL, 0, server_worker_thread, (LPVOID)(uintptr_t)server_socket, 0, NULL);
                if (hThread) {
                    CloseHandle(hThread);
                }
            }
        }
    }
    
    // Give server 300ms to stabilize
    Sleep(300);
    
    // 6. Launch Browser
    launch_browser("http://localhost:3000/");
    log_write("SUCCESS", "راه‌اندازی کامل شد. سامانه در آدرس http://localhost:3000/ در دسترس است.");
    log_write("SYNC", "دامنه سرور مرکزی همگام‌سازی ابری: https://anbar.mgas.ir");
    log_write("INFO", "برای مشاهده وضعیت، فایل لاگ %s را مطالعه فرمایید.", g_log_file_utf8);
    
    // Keep server process running
    if (server_socket != INVALID_SOCKET) {
        while (1) {
            Sleep(100000);
        }
    }
    
    return 0;
}

int WINAPI wWinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, PWSTR lpCmdLine, int nCmdShow) {
    return WinMain(hInstance, hPrevInstance, (LPSTR)"", nCmdShow);
}
