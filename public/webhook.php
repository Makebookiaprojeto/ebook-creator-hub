<?php
/**
 * Webhook PinguPag / Universal - EbookAI Builder
 * Processa notificações de pagamento do SaaS (Mensal e Vitalício)
 * Integração direta com Supabase via REST API
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$supabaseUrl = 'https://eyiwycfemptavqwpxfly.supabase.co';
$serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5aXd5Y2ZlbXB0YXZxd3B4Zmx5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDI1MDQwNywiZXhwIjoyMDk5ODI2NDA3fQ.3S03-YegGxxR795WdY1k8cei4s0uU-OEnqiVZpEz_dg';
$pingupagSecret = 'pingupag_sk_070fd938444da7400c35a89ec55ea6de3c977f613705a276ffa9b15149d563f1';

// Sanitize and secure incoming request
$rawInput = file_get_contents('php://input');

// Prevenção de exposição de dados: remove arquivo de log público se ainda existir
if (file_exists(__DIR__ . '/webhook_log.txt')) {
    @unlink(__DIR__ . '/webhook_log.txt');
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    header('Content-Type: application/json');
    echo json_encode(['status' => 'online', 'endpoint' => 'PinguPag Webhook Active']);
    exit();
}

$payload = json_decode($rawInput, true);
if (!$payload) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Invalid JSON payload']);
    exit();
}

// Extrair dados do comprador
$data = isset($payload['data']) ? $payload['data'] : $payload;
$customer = isset($data['customer']) ? $data['customer'] : (isset($payload['customer']) ? $payload['customer'] : []);

$email = '';
if (!empty($customer['email'])) {
    $email = strtolower(trim($customer['email']));
} elseif (!empty($data['email'])) {
    $email = strtolower(trim($data['email']));
} elseif (!empty($payload['email'])) {
    $email = strtolower(trim($payload['email']));
}

$status = strtolower(trim(isset($data['status']) ? $data['status'] : (isset($payload['status']) ? $payload['status'] : '')));
$transactionId = strval(isset($data['transaction_id']) ? $data['transaction_id'] : (isset($payload['transaction_id']) ? $payload['transaction_id'] : (isset($data['id']) ? $data['id'] : '')));
$amount = intval(isset($data['amount']) ? $data['amount'] : (isset($payload['amount']) ? $payload['amount'] : 0));
$description = strtolower(isset($data['description']) ? $data['description'] : (isset($payload['description']) ? $payload['description'] : ''));

// Identificação do plano (Mensal vs Vitalício)
// Hash PinguPag Mensal: bc663b82df
// Hash PinguPag Vitalício: bda346ec22
$isLifetime = false;
if (strpos($rawInput, 'bda346ec22') !== false) {
    $isLifetime = true;
} elseif (strpos($description, 'vitalicio') !== false || strpos($description, 'vitalício') !== false || strpos($description, 'lifetime') !== false) {
    $isLifetime = true;
} elseif ($amount >= 20000) { // R$ 200,00+ -> Vitalício (R$ 247,90)
    $isLifetime = true;
}

$planType = $isLifetime ? 'lifetime' : 'monthly';

// Helper curl para Supabase
function supabaseRequest($url, $method, $data = null, $extraHeaders = []) {
    global $supabaseUrl, $serviceKey;
    $ch = curl_init($url);
    $headers = array_merge([
        'apikey: ' . $serviceKey,
        'Authorization: Bearer ' . $serviceKey,
        'Content-Type: application/json'
    ], $extraHeaders);

    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

    if ($data !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, is_string($data) ? $data : json_encode($data));
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['code' => $httpCode, 'body' => $response];
}

// 1. Tratamento de Estorno / Reembolso
if ($status === 'refunded' || $status === 'chargeback') {
    $reason = $status;
    // Localizar assinatura
    $subRes = supabaseRequest($supabaseUrl . '/rest/v1/subscriptions?cakto_transaction_id=eq.' . urlencode($transactionId), 'GET');
    $subs = json_decode($subRes['body'], true);
    if (!empty($subs) && isset($subs[0])) {
        $sub = $subs[0];
        // Atualizar assinatura
        supabaseRequest($supabaseUrl . '/rest/v1/subscriptions?id=eq.' . $sub['id'], 'PATCH', [
            'status' => $reason,
            'updated_at' => date('c')
        ]);
        // Se vitalício, revogar
        if (!empty($sub['user_id'])) {
            supabaseRequest($supabaseUrl . '/rest/v1/profiles?user_id=eq.' . $sub['user_id'], 'PATCH', [
                'is_lifetime' => false
            ]);
        }
    }
    header('Content-Type: application/json');
    echo json_encode(['ok' => true, 'revoked' => true, 'reason' => $reason]);
    exit();
}

// 2. Tratamento de Pagamento Aprovado
$approvedStatuses = ['approved', 'paid', 'completed', 'success', 'succeeded'];
if (in_array($status, $approvedStatuses)) {
    if (empty($email)) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Email missing from payload']);
        exit();
    }

    // Localizar usuário no Supabase via RPC get_user_id_by_email
    $rpcRes = supabaseRequest($supabaseUrl . '/rest/v1/rpc/get_user_id_by_email', 'POST', [
        'email_param' => $email
    ]);
    $userId = json_decode($rpcRes['body'], true);

    $expiresAt = ($planType === 'lifetime') ? null : date('c', strtotime('+31 days'));

    if (!empty($userId) && is_string($userId)) {
        // Usuário cadastrado: ativar no profiles se vitalício
        if ($planType === 'lifetime') {
            supabaseRequest($supabaseUrl . '/rest/v1/profiles?user_id=eq.' . $userId, 'PATCH', [
                'is_lifetime' => true
            ]);
        }

        // Upsert na tabela subscriptions
        $upsertHeaders = ['Prefer: resolution=merge-duplicates'];
        $subData = [
            'user_id' => $userId,
            'buyer_email' => $email,
            'plan_type' => $planType,
            'status' => 'active',
            'cakto_transaction_id' => $transactionId ?: null,
            'expires_at' => $expiresAt
        ];
        $upRes = supabaseRequest($supabaseUrl . '/rest/v1/subscriptions?on_conflict=user_id', 'POST', $subData, $upsertHeaders);
        
        error_log("PinguPag ATIVADO: user=$userId email=$email plano=$planType tx=$transactionId");

        header('Content-Type: application/json');
        echo json_encode(['ok' => true, 'action' => 'activated', 'user_id' => $userId, 'plan' => $planType]);
        exit();
    } else {
        // Usuário ainda não cadastrou conta: guardar em pendência na tabela subscriptions
        $pendingRes = supabaseRequest($supabaseUrl . '/rest/v1/subscriptions?buyer_email=eq.' . urlencode($email) . '&user_id=is.null', 'GET');
        $existingPendings = json_decode($pendingRes['body'], true);

        if (!empty($existingPendings) && isset($existingPendings[0]['id'])) {
            $pendingId = $existingPendings[0]['id'];
            supabaseRequest($supabaseUrl . '/rest/v1/subscriptions?id=eq.' . $pendingId, 'PATCH', [
                'plan_type' => $planType,
                'status' => 'active',
                'cakto_transaction_id' => $transactionId ?: null,
                'expires_at' => $expiresAt,
                'updated_at' => date('c')
            ]);
        } else {
            supabaseRequest($supabaseUrl . '/rest/v1/subscriptions', 'POST', [
                'buyer_email' => $email,
                'plan_type' => $planType,
                'status' => 'active',
                'cakto_transaction_id' => $transactionId ?: null,
                'expires_at' => $expiresAt
            ]);
        }

        error_log("PinguPag PENDENTE: email=$email plano=$planType tx=$transactionId");

        header('Content-Type: application/json');
        echo json_encode(['ok' => true, 'action' => 'pending_saved', 'email' => $email, 'plan' => $planType]);
        exit();
    }
}

// Qualquer outro status (ex: pending)
header('Content-Type: application/json');
echo json_encode(['ok' => true, 'status' => $status, 'message' => 'Status acknowledged']);
exit();
