orders
| ordinal_position | column_name          | data_type                |
| ---------------- | -------------------- | ------------------------ |
| 1                | id                   | uuid                     |
| 2                | order_id             | character varying        |
| 3                | customer_id          | uuid                     |
| 4                | customer_name        | character varying        |
| 5                | customer_email       | character varying        |
| 6                | customer_phone       | character varying        |
| 7                | shipping_address     | character varying        |
| 8                | shipping_city        | character varying        |
| 9                | shipping_state       | character varying        |
| 10               | shipping_postal_code | character varying        |
| 11               | subtotal             | integer                  |
| 12               | tax_amount           | integer                  |
| 13               | shipping_amount      | integer                  |
| 14               | total_amount         | integer                  |
| 15               | order_status         | character varying        |
| 16               | estimated_delivery   | date                     |
| 17               | actual_delivery      | date                     |
| 18               | created_at           | timestamp with time zone |
| 19               | updated_at           | timestamp with time zone |
| 20               | delivery_status      | character varying        |
| 21               | dispatch_msg         | bool default false       |

order_items
| ordinal_position | column_name   | data_type                |
| ---------------- | ------------- | ------------------------ |
| 1                | id            | uuid                     |
| 2                | order_id      | uuid                     |
| 3                | product_id    | character varying        |
| 4                | product_name  | character varying        |
| 5                | product_image | character varying        |
| 6                | size          | character varying        |
| 7                | quantity      | integer                  |
| 8                | unit_price    | integer                  |
| 9                | total_price   | integer                  |
| 10               | created_at    | timestamp with time zone |

customers
| ordinal_position | column_name | data_type                |
| ---------------- | ----------- | ------------------------ |
| 1                | id          | uuid                     |
| 2                | first_name  | character varying        |
| 3                | last_name   | character varying        |
| 4                | email       | character varying        |
| 5                | phone       | character varying        |
| 6                | created_at  | timestamp with time zone |
| 7                | updated_at  | timestamp with time zone |

customer_addresses
| ordinal_position | column_name  | data_type                |
| ---------------- | ------------ | ------------------------ |
| 1                | id           | uuid                     |
| 2                | customer_id  | uuid                     |
| 3                | address_line | character varying        |
| 4                | city         | character varying        |
| 5                | state        | character varying        |
| 6                | postal_code  | character varying        |
| 7                | is_default   | boolean                  |
| 8                | created_at   | timestamp with time zone |

payments
| ordinal_position | column_name         | data_type                |
| ---------------- | ------------------- | ------------------------ |
| 1                | id                  | uuid                     |
| 2                | order_id            | uuid                     |
| 3                | payment_method      | character varying        |
| 4                | razorpay_order_id   | character varying        |
| 5                | razorpay_payment_id | character varying        |
| 6                | razorpay_signature  | character varying        |
| 7                | amount              | integer                  |
| 8                | currency            | character varying        |
| 9                | payment_status      | character varying        |
| 10               | payment_response    | jsonb                    |
| 11               | cod_collected       | boolean                  |
| 12               | cod_collected_at    | timestamp with time zone |
| 13               | refund_id           | character varying        |
| 14               | refund_amount       | integer                  |
| 15               | refund_status       | character varying        |
| 16               | refund_reason       | text                     |
| 17               | refunded_at         | timestamp with time zone |
| 18               | created_at          | timestamp with time zone |
| 19               | updated_at          | timestamp with time zone |

payment_logs
| ordinal_position | column_name | data_type                |
| ---------------- | ----------- | ------------------------ |
| 1                | id          | uuid                     |
| 2                | payment_id  | uuid                     |
| 3                | event_type  | character varying        |
| 4                | event_data  | jsonb                    |
| 5                | ip_address  | character varying        |
| 6                | user_agent  | text                     |
| 7                | created_at  | timestamp with time zone |