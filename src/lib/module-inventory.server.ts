// Generated offline by scripts/scan-modules.ts. Metadata only; no source, secrets or database rows.
import type { ModuleInventory } from './module-manager.types';
export const moduleInventory: ModuleInventory = {
  "generatedAt": "2026-10-21T18:50:17.836Z",
  "method": "离线源文件静态清单 · 字面量 import / from / rpc 分析",
  "stack": [
    {
      "name": "@tanstack/react-start",
      "version": "1.168.60"
    },
    {
      "name": "@tanstack/react-router",
      "version": "1.170.41"
    },
    {
      "name": "react",
      "version": "^19.2.0"
    },
    {
      "name": "vite",
      "version": "^7.3.1"
    },
    {
      "name": "tailwindcss",
      "version": "^4.2.1"
    },
    {
      "name": "@supabase/supabase-js",
      "version": "^2.107.0"
    }
  ],
  "modules": [
    {
      "id": "calculator",
      "name": "计算器中心",
      "category": "换算",
      "description": "通用计算器与领域计算公式。",
      "version": "未单独版本化",
      "entries": [
        "src/components/calculator/Calculator.tsx"
      ],
      "privateFiles": [],
      "sharedFiles": [
        "src/components/calculator/Calculator.tsx",
        "src/components/ui/button.tsx",
        "src/components/ui/input.tsx",
        "src/lib/calculators/automotive.ts",
        "src/lib/calculators/decoration.ts",
        "src/lib/calculators/finance.ts",
        "src/lib/calculators/health.ts",
        "src/lib/calculators/index.ts",
        "src/lib/calculators/logistics.ts",
        "src/lib/calculators/nas.ts",
        "src/lib/calculators/types.ts",
        "src/lib/calculators/usa.ts",
        "src/lib/utils.ts"
      ],
      "styles": [],
      "npm": [
        {
          "name": "react",
          "version": "^19.2.0",
          "files": [
            "src/components/calculator/Calculator.tsx",
            "src/components/ui/button.tsx",
            "src/components/ui/input.tsx"
          ]
        },
        {
          "name": "lucide-react",
          "version": "^0.575.0",
          "files": [
            "src/components/calculator/Calculator.tsx"
          ]
        },
        {
          "name": "sonner",
          "version": "^2.0.7",
          "files": [
            "src/components/calculator/Calculator.tsx"
          ]
        },
        {
          "name": "@radix-ui/react-slot",
          "version": "^1.2.4",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "class-variance-authority",
          "version": "^0.7.1",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "clsx",
          "version": "^2.1.1",
          "files": [
            "src/lib/utils.ts"
          ]
        },
        {
          "name": "tailwind-merge",
          "version": "^3.5.0",
          "files": [
            "src/lib/utils.ts"
          ]
        }
      ],
      "tables": [],
      "rpcs": [],
      "apis": [],
      "migrations": [],
      "authFiles": [],
      "unresolved": [],
      "coupledModules": [],
      "status": "待管理员审核",
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。"
      ]
    },
    {
      "id": "converter",
      "name": "单位换算",
      "category": "换算",
      "description": "通用单位转换与单位定义。",
      "version": "未单独版本化",
      "entries": [
        "src/components/converter/UnitConverter.tsx"
      ],
      "privateFiles": [],
      "sharedFiles": [
        "src/components/converter/UnitConverter.tsx",
        "src/components/ui/button.tsx",
        "src/components/ui/input.tsx",
        "src/lib/converters/area.ts",
        "src/lib/converters/fuel.ts",
        "src/lib/converters/index.ts",
        "src/lib/converters/length.ts",
        "src/lib/converters/number.ts",
        "src/lib/converters/power.ts",
        "src/lib/converters/pressure.ts",
        "src/lib/converters/speed.ts",
        "src/lib/converters/storage.ts",
        "src/lib/converters/temperature.ts",
        "src/lib/converters/types.ts",
        "src/lib/converters/units.ts",
        "src/lib/converters/volume.ts",
        "src/lib/converters/weight.ts",
        "src/lib/utils.ts"
      ],
      "styles": [],
      "npm": [
        {
          "name": "react",
          "version": "^19.2.0",
          "files": [
            "src/components/converter/UnitConverter.tsx",
            "src/components/ui/button.tsx",
            "src/components/ui/input.tsx"
          ]
        },
        {
          "name": "lucide-react",
          "version": "^0.575.0",
          "files": [
            "src/components/converter/UnitConverter.tsx"
          ]
        },
        {
          "name": "sonner",
          "version": "^2.0.7",
          "files": [
            "src/components/converter/UnitConverter.tsx"
          ]
        },
        {
          "name": "@radix-ui/react-slot",
          "version": "^1.2.4",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "class-variance-authority",
          "version": "^0.7.1",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "clsx",
          "version": "^2.1.1",
          "files": [
            "src/lib/utils.ts"
          ]
        },
        {
          "name": "tailwind-merge",
          "version": "^3.5.0",
          "files": [
            "src/lib/utils.ts"
          ]
        }
      ],
      "tables": [],
      "rpcs": [],
      "apis": [],
      "migrations": [],
      "authFiles": [],
      "unresolved": [],
      "coupledModules": [],
      "status": "待管理员审核",
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。"
      ]
    },
    {
      "id": "currency",
      "name": "汇率换算",
      "category": "换算",
      "description": "货币汇率查询与换算。",
      "version": "未单独版本化",
      "entries": [
        "src/components/currency/CurrencyConverter.tsx"
      ],
      "privateFiles": [
        "src/components/currency/CurrencyConverter.tsx"
      ],
      "sharedFiles": [
        "src/components/ui/button.tsx",
        "src/components/ui/input.tsx",
        "src/lib/utils.ts"
      ],
      "styles": [],
      "npm": [
        {
          "name": "react",
          "version": "^19.2.0",
          "files": [
            "src/components/currency/CurrencyConverter.tsx",
            "src/components/ui/button.tsx",
            "src/components/ui/input.tsx"
          ]
        },
        {
          "name": "lucide-react",
          "version": "^0.575.0",
          "files": [
            "src/components/currency/CurrencyConverter.tsx"
          ]
        },
        {
          "name": "sonner",
          "version": "^2.0.7",
          "files": [
            "src/components/currency/CurrencyConverter.tsx"
          ]
        },
        {
          "name": "@radix-ui/react-slot",
          "version": "^1.2.4",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "class-variance-authority",
          "version": "^0.7.1",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "clsx",
          "version": "^2.1.1",
          "files": [
            "src/lib/utils.ts"
          ]
        },
        {
          "name": "tailwind-merge",
          "version": "^3.5.0",
          "files": [
            "src/lib/utils.ts"
          ]
        }
      ],
      "tables": [],
      "rpcs": [],
      "apis": [
        {
          "name": "www.exchangerate-api.com",
          "files": [
            "src/components/currency/CurrencyConverter.tsx"
          ]
        },
        {
          "name": "open.er-api.com",
          "files": [
            "src/components/currency/CurrencyConverter.tsx"
          ]
        }
      ],
      "migrations": [],
      "authFiles": [],
      "unresolved": [],
      "coupledModules": [],
      "status": "待管理员审核",
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。",
        "依赖外部查询服务可用性与跨域访问；需在目标平台验证。"
      ]
    },
    {
      "id": "bible",
      "name": "圣经阅读器",
      "category": "阅读",
      "description": "CUV、CUNP、KJV 阅读组件。",
      "version": "未单独版本化",
      "entries": [
        "src/components/bible/BibleCUV.tsx",
        "src/components/bible/BibleCUNP.tsx",
        "src/components/bible/BibleKJV.tsx"
      ],
      "privateFiles": [
        "src/components/bible/BibleCUNP.tsx",
        "src/components/bible/BibleCUV.tsx",
        "src/components/bible/BibleKJV.tsx",
        "src/components/bible/BibleReader.tsx"
      ],
      "sharedFiles": [
        "src/components/ui/button.tsx",
        "src/lib/utils.ts"
      ],
      "styles": [],
      "npm": [
        {
          "name": "react",
          "version": "^19.2.0",
          "files": [
            "src/components/bible/BibleReader.tsx",
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "lucide-react",
          "version": "^0.575.0",
          "files": [
            "src/components/bible/BibleReader.tsx"
          ]
        },
        {
          "name": "@radix-ui/react-slot",
          "version": "^1.2.4",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "class-variance-authority",
          "version": "^0.7.1",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "clsx",
          "version": "^2.1.1",
          "files": [
            "src/lib/utils.ts"
          ]
        },
        {
          "name": "tailwind-merge",
          "version": "^3.5.0",
          "files": [
            "src/lib/utils.ts"
          ]
        }
      ],
      "tables": [],
      "rpcs": [],
      "apis": [
        {
          "name": "bolls.life",
          "files": [
            "src/components/bible/BibleReader.tsx"
          ]
        }
      ],
      "migrations": [],
      "authFiles": [],
      "unresolved": [],
      "coupledModules": [],
      "status": "待管理员审核",
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。",
        "依赖外部查询服务可用性与跨域访问；需在目标平台验证。"
      ]
    },
    {
      "id": "c1-exam",
      "name": "C1 模拟考试",
      "category": "考试",
      "description": "现有随机模拟考试。",
      "version": "未单独版本化",
      "entries": [
        "src/components/exam/C1MockExamHub.tsx"
      ],
      "privateFiles": [
        "src/components/exam/C1MockExamHub.tsx",
        "src/hooks/use-auth.ts",
        "src/lib/ai-knowledge.functions.ts",
        "src/lib/ai-quota.functions.ts",
        "src/lib/translate.functions.ts",
        "src/routes/p.drive.c1.tsx"
      ],
      "sharedFiles": [
        "src/assets/service-business-platforms.jpg",
        "src/assets/service-cloud-deployment.jpg",
        "src/assets/service-custom-software.jpg",
        "src/assets/service-home-media.jpg",
        "src/assets/service-home-network.jpg",
        "src/assets/service-nas.jpg",
        "src/assets/service-smart-home.jpg",
        "src/assets/service-websites.jpg",
        "src/components/SiteLayout.tsx",
        "src/components/exam/ExamOptionList.tsx",
        "src/components/ui/button.tsx",
        "src/components/ui/card.tsx",
        "src/components/ui/dialog.tsx",
        "src/components/ui/input.tsx",
        "src/components/ui/label.tsx",
        "src/components/ui/navigation-menu.tsx",
        "src/components/ui/sheet.tsx",
        "src/components/ui/sonner.tsx",
        "src/integrations/supabase/auth-middleware.ts",
        "src/integrations/supabase/client.server.ts",
        "src/integrations/supabase/client.ts",
        "src/integrations/supabase/previewAuthStorage.ts",
        "src/integrations/supabase/public-server.ts",
        "src/integrations/supabase/types.ts",
        "src/lib/cms.functions.ts",
        "src/lib/i18n.tsx",
        "src/lib/platform-bootstrap.tsx",
        "src/lib/quiz.functions.ts",
        "src/lib/services-data.ts",
        "src/lib/utils.ts"
      ],
      "styles": [],
      "npm": [
        {
          "name": "react",
          "version": "^19.2.0",
          "files": [
            "src/components/SiteLayout.tsx",
            "src/components/exam/C1MockExamHub.tsx",
            "src/components/ui/button.tsx",
            "src/components/ui/card.tsx",
            "src/components/ui/dialog.tsx",
            "src/components/ui/input.tsx",
            "src/components/ui/label.tsx",
            "src/components/ui/navigation-menu.tsx",
            "src/components/ui/sheet.tsx",
            "src/hooks/use-auth.ts",
            "src/lib/i18n.tsx",
            "src/lib/platform-bootstrap.tsx",
            "src/routes/p.drive.c1.tsx"
          ]
        },
        {
          "name": "clsx",
          "version": "^2.1.1",
          "files": [
            "src/lib/utils.ts"
          ]
        },
        {
          "name": "tailwind-merge",
          "version": "^3.5.0",
          "files": [
            "src/lib/utils.ts"
          ]
        },
        {
          "name": "@tanstack/react-router",
          "version": "1.170.41",
          "files": [
            "src/components/SiteLayout.tsx",
            "src/routes/p.drive.c1.tsx"
          ]
        },
        {
          "name": "@tanstack/react-start",
          "version": "1.168.60",
          "files": [
            "src/integrations/supabase/auth-middleware.ts",
            "src/lib/ai-knowledge.functions.ts",
            "src/lib/ai-quota.functions.ts",
            "src/lib/cms.functions.ts",
            "src/lib/platform-bootstrap.tsx",
            "src/lib/quiz.functions.ts",
            "src/lib/translate.functions.ts",
            "src/routes/p.drive.c1.tsx"
          ]
        },
        {
          "name": "@tanstack/react-query",
          "version": "^5.83.0",
          "files": [
            "src/lib/platform-bootstrap.tsx",
            "src/routes/p.drive.c1.tsx"
          ]
        },
        {
          "name": "@supabase/supabase-js",
          "version": "^2.107.0",
          "files": [
            "src/hooks/use-auth.ts",
            "src/integrations/supabase/auth-middleware.ts",
            "src/integrations/supabase/client.server.ts",
            "src/integrations/supabase/client.ts",
            "src/integrations/supabase/public-server.ts",
            "src/lib/ai-knowledge.functions.ts",
            "src/routes/p.drive.c1.tsx"
          ]
        },
        {
          "name": "lucide-react",
          "version": "^0.575.0",
          "files": [
            "src/components/SiteLayout.tsx",
            "src/components/ui/dialog.tsx",
            "src/components/ui/navigation-menu.tsx",
            "src/components/ui/sheet.tsx",
            "src/lib/services-data.ts",
            "src/routes/p.drive.c1.tsx"
          ]
        },
        {
          "name": "zod",
          "version": "^3.24.2",
          "files": [
            "src/lib/ai-knowledge.functions.ts",
            "src/lib/ai-quota.functions.ts",
            "src/lib/cms.functions.ts",
            "src/lib/quiz.functions.ts",
            "src/lib/translate.functions.ts"
          ]
        },
        {
          "name": "sonner",
          "version": "^2.0.7",
          "files": [
            "src/components/SiteLayout.tsx",
            "src/components/ui/sonner.tsx"
          ]
        },
        {
          "name": "@radix-ui/react-slot",
          "version": "^1.2.4",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "class-variance-authority",
          "version": "^0.7.1",
          "files": [
            "src/components/ui/button.tsx",
            "src/components/ui/label.tsx",
            "src/components/ui/navigation-menu.tsx",
            "src/components/ui/sheet.tsx"
          ]
        },
        {
          "name": "@radix-ui/react-label",
          "version": "^2.1.8",
          "files": [
            "src/components/ui/label.tsx"
          ]
        },
        {
          "name": "@radix-ui/react-dialog",
          "version": "^1.1.15",
          "files": [
            "src/components/ui/dialog.tsx",
            "src/components/ui/sheet.tsx"
          ]
        },
        {
          "name": "@radix-ui/react-navigation-menu",
          "version": "^1.2.14",
          "files": [
            "src/components/ui/navigation-menu.tsx"
          ]
        }
      ],
      "tables": [
        {
          "name": "ai_cache",
          "files": [
            "src/lib/ai-knowledge.functions.ts"
          ]
        },
        {
          "name": "quiz_questions",
          "files": [
            "src/lib/ai-knowledge.functions.ts",
            "src/lib/quiz.functions.ts"
          ]
        },
        {
          "name": "ai_usage_daily",
          "files": [
            "src/lib/ai-quota.functions.ts"
          ]
        },
        {
          "name": "ai_usage_logs",
          "files": [
            "src/lib/ai-quota.functions.ts"
          ]
        },
        {
          "name": "products",
          "files": [
            "src/lib/cms.functions.ts"
          ]
        },
        {
          "name": "cases",
          "files": [
            "src/lib/cms.functions.ts"
          ]
        },
        {
          "name": "site_settings",
          "files": [
            "src/lib/cms.functions.ts"
          ]
        },
        {
          "name": "pages",
          "files": [
            "src/lib/cms.functions.ts"
          ]
        },
        {
          "name": "tool_categories",
          "files": [
            "src/lib/cms.functions.ts"
          ]
        },
        {
          "name": "tool_items",
          "files": [
            "src/lib/cms.functions.ts"
          ]
        },
        {
          "name": "question_bank_nodes",
          "files": [
            "src/lib/quiz.functions.ts"
          ]
        }
      ],
      "rpcs": [
        {
          "name": "has_role",
          "files": [
            "src/lib/ai-knowledge.functions.ts"
          ]
        },
        {
          "name": "list_practice_questions",
          "files": [
            "src/lib/quiz.functions.ts"
          ]
        },
        {
          "name": "check_quiz_answer",
          "files": [
            "src/lib/quiz.functions.ts"
          ]
        },
        {
          "name": "grade_quiz_questions",
          "files": [
            "src/lib/quiz.functions.ts"
          ]
        }
      ],
      "apis": [
        {
          "name": "www.dmv.ca.gov",
          "files": [
            "src/routes/p.drive.c1.tsx"
          ]
        },
        {
          "name": "ai.gateway.lovable.dev",
          "files": [
            "src/lib/ai-knowledge.functions.ts",
            "src/lib/translate.functions.ts"
          ]
        },
        {
          "name": "lovable.dev",
          "files": [
            "src/integrations/supabase/previewAuthStorage.ts"
          ]
        },
        {
          "name": "localhost",
          "files": [
            "src/integrations/supabase/previewAuthStorage.ts"
          ]
        }
      ],
      "migrations": [
        "supabase/migrations/20260605025102_b5a1855f-984a-411a-a705-bf46012dc5b6.sql",
        "supabase/migrations/20260605025137_857d9b46-525b-4a9e-8754-8b1ea06ffc5f.sql",
        "supabase/migrations/20260605041915_f2084296-4115-4972-9522-4f2f8b6d2663.sql",
        "supabase/migrations/20260605042145_9830a646-87e5-4bb2-9cba-3b95566dffee.sql",
        "supabase/migrations/20260701150020_80a3f5d8-f7c2-4c48-a7a7-2167b418c679.sql",
        "supabase/migrations/20260701155726_58964244-bc02-4244-8029-cb2bbb228957.sql",
        "supabase/migrations/20260701161506_bf4d7def-5e05-41ba-84d7-4e99337f4f76.sql",
        "supabase/migrations/20260701195651_d1d7d914-47a0-40ee-8505-7c28c3e8b4ff.sql",
        "supabase/migrations/20260701200509_6225bdc7-d2b4-4fb7-b94d-3eed26d19051.sql",
        "supabase/migrations/20260701202716_c2df0eab-ffd2-4b59-b687-4ee2f8433e55.sql",
        "supabase/migrations/20260701210729_fcbce524-68f8-48a6-8bc2-1b360d9efe14.sql",
        "supabase/migrations/20260701214137_aead1765-5198-4547-8484-28d09b8d7032.sql",
        "supabase/migrations/20260701215012_6ba6ffd4-687d-4966-8afd-fa0b11393e46.sql",
        "supabase/migrations/20260701215650_2d93edf6-6bd2-4504-aace-8f74f08c67f8.sql",
        "supabase/migrations/20260702034259_23a6e4cd-698a-468c-bac0-47945cfcc239.sql",
        "supabase/migrations/20260702040233_9fa40e10-e794-4996-9c5a-5ae919df5f58.sql",
        "supabase/migrations/20260702040522_9726a31b-c54d-4b9b-b41b-c792287e7a4b.sql",
        "supabase/migrations/20260702042637_542dff2e-393a-46a7-8641-645e31e04e3b.sql",
        "supabase/migrations/20260702044522_ba96bfb8-52a3-43ce-9e51-40a410ad49e8.sql",
        "supabase/migrations/20260702044927_af2e4621-3eeb-4d52-be59-ee5dfa9f8433.sql",
        "supabase/migrations/20260702045449_160b3d53-8ed5-41ae-8622-72724f49f1d5.sql",
        "supabase/migrations/20260702050253_0249cd05-9bd8-4fb3-bfb4-9caabeb03807.sql",
        "supabase/migrations/20260702050635_9928d381-059e-49cc-9704-4f9a137bb863.sql",
        "supabase/migrations/20260702051702_6b3de6b6-253b-42a7-a251-612c146ee6d9.sql",
        "supabase/migrations/20260702052021_ad015fd7-f374-4b7e-93cb-fb6605b50587.sql",
        "supabase/migrations/20260702052320_ecc42f51-8864-49e7-960d-2abbac4f0f68.sql",
        "supabase/migrations/20260702151720_5e9bd5c8-a46b-4742-934a-947a53544dba.sql",
        "supabase/migrations/20260702152539_b8e92111-20f3-4aa2-861d-62bd6c8624c9.sql",
        "supabase/migrations/20260702155037_2de0ab0a-a246-4a7f-9886-8adc549c3889.sql",
        "supabase/migrations/20260702161556_28cbbee8-acc3-4b6f-adda-afccbf660122.sql",
        "supabase/migrations/20260702163515_de9164e5-8670-4aa6-ba4b-6882c157d750.sql",
        "supabase/migrations/20260702171839_ec000826-f903-4cf6-a156-9058e8311965.sql",
        "supabase/migrations/20260702175343_acd997e7-995f-41a6-b717-37159802e0a4.sql",
        "supabase/migrations/20260702193734_dbbf5a06-1887-4837-bcec-c040c4ccdaaf.sql",
        "supabase/migrations/20260702194639_24255401-3ea4-435f-8637-382da617bcc4.sql",
        "supabase/migrations/20260702195319_14b26a0b-80bb-4062-99ec-fd176c54e684.sql",
        "supabase/migrations/20260702204434_3ba0bda5-3c2c-469a-a2bb-21f7ff6bd9b3.sql",
        "supabase/migrations/20260702222447_db9f1590-7e56-4b51-8308-15b1fe909720.sql",
        "supabase/migrations/20260703045414_457a0784-3a23-4a76-acdd-802280a2fbf5.sql",
        "supabase/migrations/20260706161829_eb8b618f-3bd9-467c-8f65-9e69559f32c1.sql",
        "supabase/migrations/20260706213857_0a448fd2-0a80-4403-8652-24163babc902.sql",
        "supabase/migrations/20260708073238_2fe825bc-d1a1-4063-a570-2b1b02463c54.sql",
        "supabase/migrations/20260724040204_83ce723c-5a79-4fe7-acd0-57139228372f.sql",
        "supabase/migrations/20260724043025_d9a89132-189e-4df5-af6c-1cf1fcdd8798.sql",
        "supabase/migrations/20260724060831_8909ced7-d162-4511-ad54-88aa195c037c.sql",
        "supabase/migrations/20260724064024_8885f743-d651-4f09-a4c7-fbd768e31651.sql",
        "supabase/migrations/20260730150450_0a91a860-1371-4f70-b372-b844650dfd7a.sql",
        "supabase/migrations/20260730151005_b5cc659a-e44e-4253-8fca-e3645ac6305e.sql"
      ],
      "authFiles": [
        "src/lib/ai-knowledge.functions.ts",
        "src/integrations/supabase/auth-middleware.ts",
        "src/lib/ai-quota.functions.ts",
        "src/hooks/use-auth.ts"
      ],
      "unresolved": [],
      "coupledModules": [],
      "status": "待管理员审核",
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。",
        "需要核对 Lovable Cloud 表结构、SQL 函数、RLS 与历史迁移；不包含任何记录。",
        "包含登录或管理员权限依赖；目标项目需提供兼容的认证及角色机制。"
      ]
    },
    {
      "id": "c1-bank",
      "name": "C1 顺序题库",
      "category": "考试",
      "description": "顺序练习、收藏与错题记录。",
      "version": "未单独版本化",
      "entries": [
        "src/components/exam/C1QuestionBank.tsx",
        "src/routes/dmv.c1.question-bank.tsx"
      ],
      "privateFiles": [
        "src/components/exam/C1QuestionBank.tsx",
        "src/routes/dmv.c1.question-bank.tsx"
      ],
      "sharedFiles": [
        "src/components/exam/ExamOptionList.tsx",
        "src/components/ui/button.tsx",
        "src/components/ui/card.tsx",
        "src/components/ui/input.tsx",
        "src/integrations/supabase/public-server.ts",
        "src/integrations/supabase/types.ts",
        "src/lib/quiz.functions.ts",
        "src/lib/utils.ts"
      ],
      "styles": [],
      "npm": [
        {
          "name": "react",
          "version": "^19.2.0",
          "files": [
            "src/components/exam/C1QuestionBank.tsx",
            "src/components/ui/button.tsx",
            "src/components/ui/card.tsx",
            "src/components/ui/input.tsx"
          ]
        },
        {
          "name": "@tanstack/react-start",
          "version": "1.168.60",
          "files": [
            "src/components/exam/C1QuestionBank.tsx",
            "src/lib/quiz.functions.ts"
          ]
        },
        {
          "name": "@tanstack/react-query",
          "version": "^5.83.0",
          "files": [
            "src/components/exam/C1QuestionBank.tsx"
          ]
        },
        {
          "name": "lucide-react",
          "version": "^0.575.0",
          "files": [
            "src/components/exam/C1QuestionBank.tsx"
          ]
        },
        {
          "name": "@radix-ui/react-slot",
          "version": "^1.2.4",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "class-variance-authority",
          "version": "^0.7.1",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "clsx",
          "version": "^2.1.1",
          "files": [
            "src/lib/utils.ts"
          ]
        },
        {
          "name": "tailwind-merge",
          "version": "^3.5.0",
          "files": [
            "src/lib/utils.ts"
          ]
        },
        {
          "name": "zod",
          "version": "^3.24.2",
          "files": [
            "src/lib/quiz.functions.ts"
          ]
        },
        {
          "name": "@supabase/supabase-js",
          "version": "^2.107.0",
          "files": [
            "src/integrations/supabase/public-server.ts"
          ]
        },
        {
          "name": "@tanstack/react-router",
          "version": "1.170.41",
          "files": [
            "src/routes/dmv.c1.question-bank.tsx"
          ]
        }
      ],
      "tables": [
        {
          "name": "question_bank_nodes",
          "files": [
            "src/lib/quiz.functions.ts"
          ]
        },
        {
          "name": "quiz_questions",
          "files": [
            "src/lib/quiz.functions.ts"
          ]
        }
      ],
      "rpcs": [
        {
          "name": "list_practice_questions",
          "files": [
            "src/lib/quiz.functions.ts"
          ]
        },
        {
          "name": "check_quiz_answer",
          "files": [
            "src/lib/quiz.functions.ts"
          ]
        },
        {
          "name": "grade_quiz_questions",
          "files": [
            "src/lib/quiz.functions.ts"
          ]
        }
      ],
      "apis": [],
      "migrations": [
        "supabase/migrations/20260701214137_aead1765-5198-4547-8484-28d09b8d7032.sql",
        "supabase/migrations/20260701215012_6ba6ffd4-687d-4966-8afd-fa0b11393e46.sql",
        "supabase/migrations/20260702040233_9fa40e10-e794-4996-9c5a-5ae919df5f58.sql",
        "supabase/migrations/20260702040522_9726a31b-c54d-4b9b-b41b-c792287e7a4b.sql",
        "supabase/migrations/20260702042637_542dff2e-393a-46a7-8641-645e31e04e3b.sql",
        "supabase/migrations/20260702151720_5e9bd5c8-a46b-4742-934a-947a53544dba.sql",
        "supabase/migrations/20260702152539_b8e92111-20f3-4aa2-861d-62bd6c8624c9.sql",
        "supabase/migrations/20260702155037_2de0ab0a-a246-4a7f-9886-8adc549c3889.sql",
        "supabase/migrations/20260702163515_de9164e5-8670-4aa6-ba4b-6882c157d750.sql",
        "supabase/migrations/20260702171839_ec000826-f903-4cf6-a156-9058e8311965.sql",
        "supabase/migrations/20260730150450_0a91a860-1371-4f70-b372-b844650dfd7a.sql",
        "supabase/migrations/20260730151005_b5cc659a-e44e-4253-8fca-e3645ac6305e.sql"
      ],
      "authFiles": [],
      "unresolved": [],
      "coupledModules": [],
      "status": "待管理员审核",
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。",
        "需要核对 Lovable Cloud 表结构、SQL 函数、RLS 与历史迁移；不包含任何记录。"
      ]
    },
    {
      "id": "automotive",
      "name": "汽车工具中心",
      "category": "换算",
      "description": "汽车相关计算与工具聚合。",
      "version": "未单独版本化",
      "entries": [
        "src/components/automotive/AutomotiveHub.tsx"
      ],
      "privateFiles": [
        "src/components/automotive/AutomotiveHub.tsx"
      ],
      "sharedFiles": [
        "src/components/calculator/Calculator.tsx",
        "src/components/converter/UnitConverter.tsx",
        "src/components/ui/button.tsx",
        "src/components/ui/input.tsx",
        "src/lib/calculators/automotive.ts",
        "src/lib/calculators/decoration.ts",
        "src/lib/calculators/finance.ts",
        "src/lib/calculators/health.ts",
        "src/lib/calculators/index.ts",
        "src/lib/calculators/logistics.ts",
        "src/lib/calculators/nas.ts",
        "src/lib/calculators/types.ts",
        "src/lib/calculators/usa.ts",
        "src/lib/converters/area.ts",
        "src/lib/converters/fuel.ts",
        "src/lib/converters/index.ts",
        "src/lib/converters/length.ts",
        "src/lib/converters/number.ts",
        "src/lib/converters/power.ts",
        "src/lib/converters/pressure.ts",
        "src/lib/converters/speed.ts",
        "src/lib/converters/storage.ts",
        "src/lib/converters/temperature.ts",
        "src/lib/converters/types.ts",
        "src/lib/converters/units.ts",
        "src/lib/converters/volume.ts",
        "src/lib/converters/weight.ts",
        "src/lib/utils.ts"
      ],
      "styles": [],
      "npm": [
        {
          "name": "react",
          "version": "^19.2.0",
          "files": [
            "src/components/automotive/AutomotiveHub.tsx",
            "src/components/calculator/Calculator.tsx",
            "src/components/converter/UnitConverter.tsx",
            "src/components/ui/button.tsx",
            "src/components/ui/input.tsx"
          ]
        },
        {
          "name": "lucide-react",
          "version": "^0.575.0",
          "files": [
            "src/components/automotive/AutomotiveHub.tsx",
            "src/components/calculator/Calculator.tsx",
            "src/components/converter/UnitConverter.tsx"
          ]
        },
        {
          "name": "sonner",
          "version": "^2.0.7",
          "files": [
            "src/components/calculator/Calculator.tsx",
            "src/components/converter/UnitConverter.tsx"
          ]
        },
        {
          "name": "@radix-ui/react-slot",
          "version": "^1.2.4",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "class-variance-authority",
          "version": "^0.7.1",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "clsx",
          "version": "^2.1.1",
          "files": [
            "src/lib/utils.ts"
          ]
        },
        {
          "name": "tailwind-merge",
          "version": "^3.5.0",
          "files": [
            "src/lib/utils.ts"
          ]
        }
      ],
      "tables": [],
      "rpcs": [],
      "apis": [],
      "migrations": [],
      "authFiles": [],
      "unresolved": [],
      "coupledModules": [
        "calculator",
        "converter"
      ],
      "status": "待管理员审核",
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。"
      ]
    },
    {
      "id": "photo-wall",
      "name": "Photo Wall Studio",
      "category": "创作",
      "description": "照片墙编辑、时间轴、场景与导出。",
      "version": "未单独版本化",
      "entries": [
        "src/routes/tools.photo-wall.index.tsx",
        "src/components/photowall/StudioEditor.tsx",
        "src/routes/tools.photo-wall.$id.tsx",
        "src/routes/display.photo-wall-preview.$id.tsx"
      ],
      "privateFiles": [
        "src/components/admin/ConfirmDialog.tsx",
        "src/components/photowall/AnimationLibrary.tsx",
        "src/components/photowall/Inspector.tsx",
        "src/components/photowall/LeftPanels.tsx",
        "src/components/photowall/PlaybackBar.tsx",
        "src/components/photowall/PreviewCanvas.tsx",
        "src/components/photowall/StudioEditor.tsx",
        "src/components/photowall/Timeline.tsx",
        "src/components/photowall/ctx.ts",
        "src/components/photowall/rail.ts",
        "src/lib/photowall/animations.ts",
        "src/lib/photowall/audio.ts",
        "src/lib/photowall/export.ts",
        "src/lib/photowall/fx.ts",
        "src/lib/photowall/poster.functions.ts",
        "src/lib/photowall/poster.server.ts",
        "src/lib/photowall/presets.ts",
        "src/lib/photowall/render.ts",
        "src/lib/photowall/scenes.ts",
        "src/lib/photowall/store.ts",
        "src/lib/photowall/text.ts",
        "src/lib/photowall/types.ts",
        "src/routes/display.photo-wall-preview.$id.tsx",
        "src/routes/tools.photo-wall.$id.tsx",
        "src/routes/tools.photo-wall.index.tsx"
      ],
      "sharedFiles": [
        "src/assets/service-business-platforms.jpg",
        "src/assets/service-cloud-deployment.jpg",
        "src/assets/service-custom-software.jpg",
        "src/assets/service-home-media.jpg",
        "src/assets/service-home-network.jpg",
        "src/assets/service-nas.jpg",
        "src/assets/service-smart-home.jpg",
        "src/assets/service-websites.jpg",
        "src/components/SiteLayout.tsx",
        "src/components/ui/alert-dialog.tsx",
        "src/components/ui/button.tsx",
        "src/components/ui/context-menu.tsx",
        "src/components/ui/dialog.tsx",
        "src/components/ui/dropdown-menu.tsx",
        "src/components/ui/input.tsx",
        "src/components/ui/label.tsx",
        "src/components/ui/navigation-menu.tsx",
        "src/components/ui/progress.tsx",
        "src/components/ui/select.tsx",
        "src/components/ui/sheet.tsx",
        "src/components/ui/slider.tsx",
        "src/components/ui/sonner.tsx",
        "src/components/ui/switch.tsx",
        "src/components/ui/textarea.tsx",
        "src/components/ui/tooltip.tsx",
        "src/integrations/supabase/public-server.ts",
        "src/integrations/supabase/types.ts",
        "src/lib/cms.functions.ts",
        "src/lib/i18n.tsx",
        "src/lib/platform-bootstrap.tsx",
        "src/lib/services-data.ts",
        "src/lib/utils.ts"
      ],
      "styles": [],
      "npm": [
        {
          "name": "react",
          "version": "^19.2.0",
          "files": [
            "src/components/SiteLayout.tsx",
            "src/components/admin/ConfirmDialog.tsx",
            "src/components/photowall/AnimationLibrary.tsx",
            "src/components/photowall/Inspector.tsx",
            "src/components/photowall/LeftPanels.tsx",
            "src/components/photowall/PlaybackBar.tsx",
            "src/components/photowall/PreviewCanvas.tsx",
            "src/components/photowall/StudioEditor.tsx",
            "src/components/photowall/Timeline.tsx",
            "src/components/photowall/ctx.ts",
            "src/components/ui/alert-dialog.tsx",
            "src/components/ui/button.tsx",
            "src/components/ui/context-menu.tsx",
            "src/components/ui/dialog.tsx",
            "src/components/ui/dropdown-menu.tsx",
            "src/components/ui/input.tsx",
            "src/components/ui/label.tsx",
            "src/components/ui/navigation-menu.tsx",
            "src/components/ui/progress.tsx",
            "src/components/ui/select.tsx",
            "src/components/ui/sheet.tsx",
            "src/components/ui/slider.tsx",
            "src/components/ui/switch.tsx",
            "src/components/ui/textarea.tsx",
            "src/components/ui/tooltip.tsx",
            "src/lib/i18n.tsx",
            "src/lib/platform-bootstrap.tsx",
            "src/routes/display.photo-wall-preview.$id.tsx",
            "src/routes/tools.photo-wall.$id.tsx",
            "src/routes/tools.photo-wall.index.tsx"
          ]
        },
        {
          "name": "@tanstack/react-router",
          "version": "1.170.41",
          "files": [
            "src/components/SiteLayout.tsx",
            "src/components/photowall/StudioEditor.tsx",
            "src/routes/display.photo-wall-preview.$id.tsx",
            "src/routes/tools.photo-wall.$id.tsx",
            "src/routes/tools.photo-wall.index.tsx"
          ]
        },
        {
          "name": "lucide-react",
          "version": "^0.575.0",
          "files": [
            "src/components/SiteLayout.tsx",
            "src/components/photowall/AnimationLibrary.tsx",
            "src/components/photowall/Inspector.tsx",
            "src/components/photowall/LeftPanels.tsx",
            "src/components/photowall/StudioEditor.tsx",
            "src/components/photowall/Timeline.tsx",
            "src/components/photowall/rail.ts",
            "src/components/ui/context-menu.tsx",
            "src/components/ui/dialog.tsx",
            "src/components/ui/dropdown-menu.tsx",
            "src/components/ui/navigation-menu.tsx",
            "src/components/ui/select.tsx",
            "src/components/ui/sheet.tsx",
            "src/lib/services-data.ts",
            "src/routes/display.photo-wall-preview.$id.tsx",
            "src/routes/tools.photo-wall.$id.tsx",
            "src/routes/tools.photo-wall.index.tsx"
          ]
        },
        {
          "name": "sonner",
          "version": "^2.0.7",
          "files": [
            "src/components/SiteLayout.tsx",
            "src/components/photowall/AnimationLibrary.tsx",
            "src/components/photowall/LeftPanels.tsx",
            "src/components/photowall/StudioEditor.tsx",
            "src/components/ui/sonner.tsx"
          ]
        },
        {
          "name": "@radix-ui/react-slot",
          "version": "^1.2.4",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "class-variance-authority",
          "version": "^0.7.1",
          "files": [
            "src/components/ui/button.tsx",
            "src/components/ui/label.tsx",
            "src/components/ui/navigation-menu.tsx",
            "src/components/ui/sheet.tsx"
          ]
        },
        {
          "name": "clsx",
          "version": "^2.1.1",
          "files": [
            "src/lib/utils.ts"
          ]
        },
        {
          "name": "tailwind-merge",
          "version": "^3.5.0",
          "files": [
            "src/lib/utils.ts"
          ]
        },
        {
          "name": "@radix-ui/react-label",
          "version": "^2.1.8",
          "files": [
            "src/components/ui/label.tsx"
          ]
        },
        {
          "name": "@radix-ui/react-dialog",
          "version": "^1.1.15",
          "files": [
            "src/components/ui/dialog.tsx",
            "src/components/ui/sheet.tsx"
          ]
        },
        {
          "name": "@radix-ui/react-navigation-menu",
          "version": "^1.2.14",
          "files": [
            "src/components/ui/navigation-menu.tsx"
          ]
        },
        {
          "name": "@tanstack/react-query",
          "version": "^5.83.0",
          "files": [
            "src/lib/platform-bootstrap.tsx"
          ]
        },
        {
          "name": "@tanstack/react-start",
          "version": "1.168.60",
          "files": [
            "src/components/photowall/LeftPanels.tsx",
            "src/lib/cms.functions.ts",
            "src/lib/photowall/poster.functions.ts",
            "src/lib/platform-bootstrap.tsx"
          ]
        },
        {
          "name": "zod",
          "version": "^3.24.2",
          "files": [
            "src/lib/cms.functions.ts",
            "src/lib/photowall/poster.functions.ts"
          ]
        },
        {
          "name": "@supabase/supabase-js",
          "version": "^2.107.0",
          "files": [
            "src/integrations/supabase/public-server.ts"
          ]
        },
        {
          "name": "@radix-ui/react-alert-dialog",
          "version": "^1.1.15",
          "files": [
            "src/components/ui/alert-dialog.tsx"
          ]
        },
        {
          "name": "@radix-ui/react-slider",
          "version": "^1.3.6",
          "files": [
            "src/components/ui/slider.tsx"
          ]
        },
        {
          "name": "@radix-ui/react-tooltip",
          "version": "^1.2.8",
          "files": [
            "src/components/ui/tooltip.tsx"
          ]
        },
        {
          "name": "@radix-ui/react-dropdown-menu",
          "version": "^2.1.16",
          "files": [
            "src/components/ui/dropdown-menu.tsx"
          ]
        },
        {
          "name": "@radix-ui/react-switch",
          "version": "^1.2.6",
          "files": [
            "src/components/ui/switch.tsx"
          ]
        },
        {
          "name": "@radix-ui/react-progress",
          "version": "^1.1.8",
          "files": [
            "src/components/ui/progress.tsx"
          ]
        },
        {
          "name": "@radix-ui/react-select",
          "version": "^2.2.6",
          "files": [
            "src/components/ui/select.tsx"
          ]
        },
        {
          "name": "@radix-ui/react-context-menu",
          "version": "^2.2.16",
          "files": [
            "src/components/ui/context-menu.tsx"
          ]
        }
      ],
      "tables": [
        {
          "name": "products",
          "files": [
            "src/lib/cms.functions.ts"
          ]
        },
        {
          "name": "cases",
          "files": [
            "src/lib/cms.functions.ts"
          ]
        },
        {
          "name": "site_settings",
          "files": [
            "src/lib/cms.functions.ts"
          ]
        },
        {
          "name": "pages",
          "files": [
            "src/lib/cms.functions.ts"
          ]
        },
        {
          "name": "tool_categories",
          "files": [
            "src/lib/cms.functions.ts"
          ]
        },
        {
          "name": "tool_items",
          "files": [
            "src/lib/cms.functions.ts"
          ]
        }
      ],
      "rpcs": [],
      "apis": [
        {
          "name": "ai.gateway.lovable.dev",
          "files": [
            "src/lib/photowall/poster.server.ts"
          ]
        }
      ],
      "migrations": [
        "supabase/migrations/20260605025102_b5a1855f-984a-411a-a705-bf46012dc5b6.sql",
        "supabase/migrations/20260605042145_9830a646-87e5-4bb2-9cba-3b95566dffee.sql",
        "supabase/migrations/20260701150020_80a3f5d8-f7c2-4c48-a7a7-2167b418c679.sql",
        "supabase/migrations/20260701155726_58964244-bc02-4244-8029-cb2bbb228957.sql",
        "supabase/migrations/20260701161506_bf4d7def-5e05-41ba-84d7-4e99337f4f76.sql",
        "supabase/migrations/20260701195651_d1d7d914-47a0-40ee-8505-7c28c3e8b4ff.sql",
        "supabase/migrations/20260701200509_6225bdc7-d2b4-4fb7-b94d-3eed26d19051.sql",
        "supabase/migrations/20260701202716_c2df0eab-ffd2-4b59-b687-4ee2f8433e55.sql",
        "supabase/migrations/20260701210729_fcbce524-68f8-48a6-8bc2-1b360d9efe14.sql",
        "supabase/migrations/20260701215650_2d93edf6-6bd2-4504-aace-8f74f08c67f8.sql",
        "supabase/migrations/20260702034259_23a6e4cd-698a-468c-bac0-47945cfcc239.sql",
        "supabase/migrations/20260702044927_af2e4621-3eeb-4d52-be59-ee5dfa9f8433.sql",
        "supabase/migrations/20260702050253_0249cd05-9bd8-4fb3-bfb4-9caabeb03807.sql",
        "supabase/migrations/20260702052021_ad015fd7-f374-4b7e-93cb-fb6605b50587.sql",
        "supabase/migrations/20260702171839_ec000826-f903-4cf6-a156-9058e8311965.sql",
        "supabase/migrations/20260702175343_acd997e7-995f-41a6-b717-37159802e0a4.sql",
        "supabase/migrations/20260702193734_dbbf5a06-1887-4837-bcec-c040c4ccdaaf.sql",
        "supabase/migrations/20260702194639_24255401-3ea4-435f-8637-382da617bcc4.sql",
        "supabase/migrations/20260702195319_14b26a0b-80bb-4062-99ec-fd176c54e684.sql",
        "supabase/migrations/20260702204434_3ba0bda5-3c2c-469a-a2bb-21f7ff6bd9b3.sql",
        "supabase/migrations/20260702222447_db9f1590-7e56-4b51-8308-15b1fe909720.sql",
        "supabase/migrations/20260706213857_0a448fd2-0a80-4403-8652-24163babc902.sql",
        "supabase/migrations/20260724060831_8909ced7-d162-4511-ad54-88aa195c037c.sql"
      ],
      "authFiles": [],
      "unresolved": [],
      "coupledModules": [],
      "status": "待管理员审核",
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。",
        "依赖浏览器 IndexedDB、图片/音乐资源与浏览器视频编码能力；清单不包含用户项目或媒体。",
        "需要核对 Lovable Cloud 表结构、SQL 函数、RLS 与历史迁移；不包含任何记录。"
      ]
    },
    {
      "id": "solution-builder",
      "name": "Solution Builder",
      "category": "方案",
      "description": "硬件配置、兼容规则、PDF 和分享。",
      "version": "未单独版本化",
      "entries": [
        "src/components/solution-builder/BuilderShell.tsx",
        "src/routes/tools.solution-builder.index.tsx",
        "src/lib/solution-builder.functions.ts"
      ],
      "privateFiles": [
        "src/components/solution-builder/BuilderShell.tsx",
        "src/components/solution-builder/SubmitDialog.tsx",
        "src/components/solution-builder/builderHelpers.ts",
        "src/components/solution-builder/pdf.ts",
        "src/components/solution-builder/pdfFontLoader.ts",
        "src/lib/solution-builder.functions.ts",
        "src/lib/solution-builder/calc.ts",
        "src/lib/solution-builder/compat.ts",
        "src/lib/solution-builder/i18n.ts",
        "src/lib/solution-builder/types.ts",
        "src/routes/tools.solution-builder.index.tsx"
      ],
      "sharedFiles": [
        "src/assets/service-business-platforms.jpg",
        "src/assets/service-cloud-deployment.jpg",
        "src/assets/service-custom-software.jpg",
        "src/assets/service-home-media.jpg",
        "src/assets/service-home-network.jpg",
        "src/assets/service-nas.jpg",
        "src/assets/service-smart-home.jpg",
        "src/assets/service-websites.jpg",
        "src/components/SiteLayout.tsx",
        "src/components/ui/button.tsx",
        "src/components/ui/dialog.tsx",
        "src/components/ui/input.tsx",
        "src/components/ui/label.tsx",
        "src/components/ui/navigation-menu.tsx",
        "src/components/ui/sheet.tsx",
        "src/components/ui/sonner.tsx",
        "src/components/ui/textarea.tsx",
        "src/integrations/supabase/auth-middleware.ts",
        "src/integrations/supabase/client.server.ts",
        "src/integrations/supabase/client.ts",
        "src/integrations/supabase/previewAuthStorage.ts",
        "src/integrations/supabase/public-server.ts",
        "src/integrations/supabase/types.ts",
        "src/lib/cms.functions.ts",
        "src/lib/i18n.tsx",
        "src/lib/platform-bootstrap.tsx",
        "src/lib/platform.ts",
        "src/lib/services-data.ts",
        "src/lib/utils.ts"
      ],
      "styles": [],
      "npm": [
        {
          "name": "react",
          "version": "^19.2.0",
          "files": [
            "src/components/SiteLayout.tsx",
            "src/components/solution-builder/BuilderShell.tsx",
            "src/components/solution-builder/SubmitDialog.tsx",
            "src/components/solution-builder/builderHelpers.ts",
            "src/components/ui/button.tsx",
            "src/components/ui/dialog.tsx",
            "src/components/ui/input.tsx",
            "src/components/ui/label.tsx",
            "src/components/ui/navigation-menu.tsx",
            "src/components/ui/sheet.tsx",
            "src/components/ui/textarea.tsx",
            "src/lib/i18n.tsx",
            "src/lib/platform-bootstrap.tsx"
          ]
        },
        {
          "name": "@tanstack/react-router",
          "version": "1.170.41",
          "files": [
            "src/components/SiteLayout.tsx",
            "src/components/solution-builder/BuilderShell.tsx",
            "src/routes/tools.solution-builder.index.tsx"
          ]
        },
        {
          "name": "@tanstack/react-start",
          "version": "1.168.60",
          "files": [
            "src/components/solution-builder/BuilderShell.tsx",
            "src/components/solution-builder/builderHelpers.ts",
            "src/integrations/supabase/auth-middleware.ts",
            "src/lib/cms.functions.ts",
            "src/lib/platform-bootstrap.tsx",
            "src/lib/solution-builder.functions.ts"
          ]
        },
        {
          "name": "@tanstack/react-query",
          "version": "^5.83.0",
          "files": [
            "src/components/solution-builder/BuilderShell.tsx",
            "src/components/solution-builder/builderHelpers.ts",
            "src/lib/platform-bootstrap.tsx"
          ]
        },
        {
          "name": "sonner",
          "version": "^2.0.7",
          "files": [
            "src/components/SiteLayout.tsx",
            "src/components/solution-builder/BuilderShell.tsx",
            "src/components/ui/sonner.tsx"
          ]
        },
        {
          "name": "lucide-react",
          "version": "^0.575.0",
          "files": [
            "src/components/SiteLayout.tsx",
            "src/components/solution-builder/BuilderShell.tsx",
            "src/components/ui/dialog.tsx",
            "src/components/ui/navigation-menu.tsx",
            "src/components/ui/sheet.tsx",
            "src/lib/services-data.ts",
            "src/routes/tools.solution-builder.index.tsx"
          ]
        },
        {
          "name": "@radix-ui/react-slot",
          "version": "^1.2.4",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "class-variance-authority",
          "version": "^0.7.1",
          "files": [
            "src/components/ui/button.tsx",
            "src/components/ui/label.tsx",
            "src/components/ui/navigation-menu.tsx",
            "src/components/ui/sheet.tsx"
          ]
        },
        {
          "name": "clsx",
          "version": "^2.1.1",
          "files": [
            "src/lib/utils.ts"
          ]
        },
        {
          "name": "tailwind-merge",
          "version": "^3.5.0",
          "files": [
            "src/lib/utils.ts"
          ]
        },
        {
          "name": "@radix-ui/react-dialog",
          "version": "^1.1.15",
          "files": [
            "src/components/ui/dialog.tsx",
            "src/components/ui/sheet.tsx"
          ]
        },
        {
          "name": "@supabase/supabase-js",
          "version": "^2.107.0",
          "files": [
            "src/integrations/supabase/auth-middleware.ts",
            "src/integrations/supabase/client.server.ts",
            "src/integrations/supabase/client.ts",
            "src/integrations/supabase/public-server.ts",
            "src/lib/platform.ts",
            "src/lib/solution-builder.functions.ts"
          ]
        },
        {
          "name": "zod",
          "version": "^3.24.2",
          "files": [
            "src/lib/cms.functions.ts",
            "src/lib/solution-builder.functions.ts"
          ]
        },
        {
          "name": "jspdf",
          "version": "^4.2.1",
          "files": [
            "src/components/solution-builder/pdf.ts"
          ]
        },
        {
          "name": "html2canvas-pro",
          "version": "^2.3.1",
          "files": [
            "src/components/solution-builder/pdf.ts"
          ]
        },
        {
          "name": "@fontsource/noto-sans-sc",
          "version": "^5.3.0",
          "files": [
            "src/components/solution-builder/pdfFontLoader.ts"
          ]
        },
        {
          "name": "@radix-ui/react-label",
          "version": "^2.1.8",
          "files": [
            "src/components/ui/label.tsx"
          ]
        },
        {
          "name": "@radix-ui/react-navigation-menu",
          "version": "^1.2.14",
          "files": [
            "src/components/ui/navigation-menu.tsx"
          ]
        }
      ],
      "tables": [
        {
          "name": "sb_products",
          "files": [
            "src/lib/solution-builder.functions.ts"
          ]
        },
        {
          "name": "solution_compatibility_rules",
          "files": [
            "src/lib/solution-builder.functions.ts"
          ]
        },
        {
          "name": "sb_settings",
          "files": [
            "src/lib/solution-builder.functions.ts"
          ]
        },
        {
          "name": "sb_solutions",
          "files": [
            "src/lib/solution-builder.functions.ts"
          ]
        },
        {
          "name": "solution_product_brands",
          "files": [
            "src/lib/solution-builder.functions.ts"
          ]
        },
        {
          "name": "solution_product_categories",
          "files": [
            "src/lib/solution-builder.functions.ts"
          ]
        },
        {
          "name": "solution_price_history",
          "files": [
            "src/lib/solution-builder.functions.ts"
          ]
        },
        {
          "name": "user_roles",
          "files": [
            "src/lib/platform.ts"
          ]
        },
        {
          "name": "products",
          "files": [
            "src/lib/cms.functions.ts"
          ]
        },
        {
          "name": "cases",
          "files": [
            "src/lib/cms.functions.ts"
          ]
        },
        {
          "name": "site_settings",
          "files": [
            "src/lib/cms.functions.ts"
          ]
        },
        {
          "name": "pages",
          "files": [
            "src/lib/cms.functions.ts"
          ]
        },
        {
          "name": "tool_categories",
          "files": [
            "src/lib/cms.functions.ts"
          ]
        },
        {
          "name": "tool_items",
          "files": [
            "src/lib/cms.functions.ts"
          ]
        }
      ],
      "rpcs": [],
      "apis": [
        {
          "name": "lovable.dev",
          "files": [
            "src/integrations/supabase/previewAuthStorage.ts"
          ]
        },
        {
          "name": "localhost",
          "files": [
            "src/integrations/supabase/previewAuthStorage.ts"
          ]
        }
      ],
      "migrations": [
        "supabase/migrations/20260605025102_b5a1855f-984a-411a-a705-bf46012dc5b6.sql",
        "supabase/migrations/20260605041821_89193d7f-8534-4876-9f51-9d5b4f24528c.sql",
        "supabase/migrations/20260605041915_f2084296-4115-4972-9522-4f2f8b6d2663.sql",
        "supabase/migrations/20260605042003_6cd94604-6df1-416c-96e1-e1d8258c5bb8.sql",
        "supabase/migrations/20260605042145_9830a646-87e5-4bb2-9cba-3b95566dffee.sql",
        "supabase/migrations/20260701150020_80a3f5d8-f7c2-4c48-a7a7-2167b418c679.sql",
        "supabase/migrations/20260701155726_58964244-bc02-4244-8029-cb2bbb228957.sql",
        "supabase/migrations/20260701161506_bf4d7def-5e05-41ba-84d7-4e99337f4f76.sql",
        "supabase/migrations/20260701195651_d1d7d914-47a0-40ee-8505-7c28c3e8b4ff.sql",
        "supabase/migrations/20260701200509_6225bdc7-d2b4-4fb7-b94d-3eed26d19051.sql",
        "supabase/migrations/20260701202716_c2df0eab-ffd2-4b59-b687-4ee2f8433e55.sql",
        "supabase/migrations/20260701210729_fcbce524-68f8-48a6-8bc2-1b360d9efe14.sql",
        "supabase/migrations/20260701215012_6ba6ffd4-687d-4966-8afd-fa0b11393e46.sql",
        "supabase/migrations/20260701215650_2d93edf6-6bd2-4504-aace-8f74f08c67f8.sql",
        "supabase/migrations/20260702034259_23a6e4cd-698a-468c-bac0-47945cfcc239.sql",
        "supabase/migrations/20260702044927_af2e4621-3eeb-4d52-be59-ee5dfa9f8433.sql",
        "supabase/migrations/20260702050253_0249cd05-9bd8-4fb3-bfb4-9caabeb03807.sql",
        "supabase/migrations/20260702052021_ad015fd7-f374-4b7e-93cb-fb6605b50587.sql",
        "supabase/migrations/20260702171839_ec000826-f903-4cf6-a156-9058e8311965.sql",
        "supabase/migrations/20260702175343_acd997e7-995f-41a6-b717-37159802e0a4.sql",
        "supabase/migrations/20260702193734_dbbf5a06-1887-4837-bcec-c040c4ccdaaf.sql",
        "supabase/migrations/20260702194639_24255401-3ea4-435f-8637-382da617bcc4.sql",
        "supabase/migrations/20260702195319_14b26a0b-80bb-4062-99ec-fd176c54e684.sql",
        "supabase/migrations/20260702204434_3ba0bda5-3c2c-469a-a2bb-21f7ff6bd9b3.sql",
        "supabase/migrations/20260702222447_db9f1590-7e56-4b51-8308-15b1fe909720.sql",
        "supabase/migrations/20260702222743_c25634c7-0413-4941-b766-81e586bb9565.sql",
        "supabase/migrations/20260706213857_0a448fd2-0a80-4403-8652-24163babc902.sql",
        "supabase/migrations/20260724043025_d9a89132-189e-4df5-af6c-1cf1fcdd8798.sql",
        "supabase/migrations/20260724060831_8909ced7-d162-4511-ad54-88aa195c037c.sql",
        "supabase/migrations/20260724063833_3e42d9ad-4623-406c-9cd0-f5029f794c2c.sql",
        "supabase/migrations/20260724064024_8885f743-d651-4f09-a4c7-fbd768e31651.sql",
        "supabase/migrations/20260724070041_f40d8a2b-e2ef-480b-9465-bb7e207baed7.sql",
        "supabase/migrations/20260724071106_3866f694-58e0-4151-b479-106095a4f81f.sql"
      ],
      "authFiles": [
        "src/lib/solution-builder.functions.ts",
        "src/integrations/supabase/auth-middleware.ts",
        "src/lib/platform.ts"
      ],
      "unresolved": [],
      "coupledModules": [],
      "status": "待管理员审核",
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。",
        "需要核对 Lovable Cloud 表结构、SQL 函数、RLS 与历史迁移；不包含任何记录。",
        "包含登录或管理员权限依赖；目标项目需提供兼容的认证及角色机制。"
      ]
    },
    {
      "id": "ai-tools",
      "name": "AI 助手",
      "category": "AI",
      "description": "统一 AI 工具与服务调用。",
      "version": "未单独版本化",
      "entries": [
        "src/components/ai/AiToolByKey.tsx"
      ],
      "privateFiles": [
        "src/components/ai/AiToolByKey.tsx",
        "src/lib/ai.functions.ts"
      ],
      "sharedFiles": [
        "src/components/ui/button.tsx",
        "src/components/ui/input.tsx",
        "src/components/ui/label.tsx",
        "src/components/ui/textarea.tsx",
        "src/lib/utils.ts"
      ],
      "styles": [],
      "npm": [
        {
          "name": "react",
          "version": "^19.2.0",
          "files": [
            "src/components/ai/AiToolByKey.tsx",
            "src/components/ui/button.tsx",
            "src/components/ui/input.tsx",
            "src/components/ui/label.tsx",
            "src/components/ui/textarea.tsx"
          ]
        },
        {
          "name": "@tanstack/react-query",
          "version": "^5.83.0",
          "files": [
            "src/components/ai/AiToolByKey.tsx"
          ]
        },
        {
          "name": "@tanstack/react-start",
          "version": "1.168.60",
          "files": [
            "src/components/ai/AiToolByKey.tsx",
            "src/lib/ai.functions.ts"
          ]
        },
        {
          "name": "lucide-react",
          "version": "^0.575.0",
          "files": [
            "src/components/ai/AiToolByKey.tsx"
          ]
        },
        {
          "name": "sonner",
          "version": "^2.0.7",
          "files": [
            "src/components/ai/AiToolByKey.tsx"
          ]
        },
        {
          "name": "zod",
          "version": "^3.24.2",
          "files": [
            "src/lib/ai.functions.ts"
          ]
        },
        {
          "name": "@radix-ui/react-slot",
          "version": "^1.2.4",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "class-variance-authority",
          "version": "^0.7.1",
          "files": [
            "src/components/ui/button.tsx",
            "src/components/ui/label.tsx"
          ]
        },
        {
          "name": "clsx",
          "version": "^2.1.1",
          "files": [
            "src/lib/utils.ts"
          ]
        },
        {
          "name": "tailwind-merge",
          "version": "^3.5.0",
          "files": [
            "src/lib/utils.ts"
          ]
        },
        {
          "name": "@radix-ui/react-label",
          "version": "^2.1.8",
          "files": [
            "src/components/ui/label.tsx"
          ]
        }
      ],
      "tables": [],
      "rpcs": [],
      "apis": [
        {
          "name": "ai.gateway.lovable.dev",
          "files": [
            "src/lib/ai.functions.ts"
          ]
        }
      ],
      "migrations": [],
      "authFiles": [],
      "unresolved": [],
      "coupledModules": [],
      "status": "待管理员审核",
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。",
        "依赖目标平台的 AI Gateway 凭据与服务额度；清单不包含密钥。"
      ]
    },
    {
      "id": "dev-tools",
      "name": "开发工具",
      "category": "工具",
      "description": "文本与开发格式处理。",
      "version": "未单独版本化",
      "entries": [
        "src/components/tools/DevTool.tsx"
      ],
      "privateFiles": [
        "src/components/tools/DevTool.tsx"
      ],
      "sharedFiles": [
        "src/components/tools/ToolShell.tsx",
        "src/components/ui/button.tsx",
        "src/components/ui/input.tsx",
        "src/components/ui/textarea.tsx",
        "src/lib/utils.ts"
      ],
      "styles": [],
      "npm": [
        {
          "name": "react",
          "version": "^19.2.0",
          "files": [
            "src/components/tools/DevTool.tsx",
            "src/components/tools/ToolShell.tsx",
            "src/components/ui/button.tsx",
            "src/components/ui/input.tsx",
            "src/components/ui/textarea.tsx"
          ]
        },
        {
          "name": "js-yaml",
          "version": "^5.2.0",
          "files": [
            "src/components/tools/DevTool.tsx"
          ]
        },
        {
          "name": "xml-formatter",
          "version": "^3.7.0",
          "files": [
            "src/components/tools/DevTool.tsx"
          ]
        },
        {
          "name": "cronstrue",
          "version": "^3.24.0",
          "files": [
            "src/components/tools/DevTool.tsx"
          ]
        },
        {
          "name": "lucide-react",
          "version": "^0.575.0",
          "files": [
            "src/components/tools/ToolShell.tsx"
          ]
        },
        {
          "name": "sonner",
          "version": "^2.0.7",
          "files": [
            "src/components/tools/ToolShell.tsx"
          ]
        },
        {
          "name": "@radix-ui/react-slot",
          "version": "^1.2.4",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "class-variance-authority",
          "version": "^0.7.1",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "clsx",
          "version": "^2.1.1",
          "files": [
            "src/lib/utils.ts"
          ]
        },
        {
          "name": "tailwind-merge",
          "version": "^3.5.0",
          "files": [
            "src/lib/utils.ts"
          ]
        }
      ],
      "tables": [],
      "rpcs": [],
      "apis": [],
      "migrations": [],
      "authFiles": [],
      "unresolved": [],
      "coupledModules": [],
      "status": "待管理员审核",
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。"
      ]
    },
    {
      "id": "text-tools",
      "name": "文本工具",
      "category": "工具",
      "description": "文本处理工具组。",
      "version": "未单独版本化",
      "entries": [
        "src/components/tools/TextTool.tsx"
      ],
      "privateFiles": [
        "src/components/tools/TextTool.tsx"
      ],
      "sharedFiles": [
        "src/components/tools/ToolShell.tsx",
        "src/components/ui/button.tsx",
        "src/components/ui/textarea.tsx",
        "src/lib/utils.ts"
      ],
      "styles": [],
      "npm": [
        {
          "name": "react",
          "version": "^19.2.0",
          "files": [
            "src/components/tools/TextTool.tsx",
            "src/components/tools/ToolShell.tsx",
            "src/components/ui/button.tsx",
            "src/components/ui/textarea.tsx"
          ]
        },
        {
          "name": "spark-md5",
          "version": "^3.0.2",
          "files": [
            "src/components/tools/TextTool.tsx"
          ]
        },
        {
          "name": "opencc-js",
          "version": "^1.3.2",
          "files": [
            "src/components/tools/TextTool.tsx"
          ]
        },
        {
          "name": "marked",
          "version": "^18.0.7",
          "files": [
            "src/components/tools/TextTool.tsx"
          ]
        },
        {
          "name": "diff",
          "version": "^9.0.0",
          "files": [
            "src/components/tools/TextTool.tsx"
          ]
        },
        {
          "name": "lucide-react",
          "version": "^0.575.0",
          "files": [
            "src/components/tools/ToolShell.tsx"
          ]
        },
        {
          "name": "sonner",
          "version": "^2.0.7",
          "files": [
            "src/components/tools/ToolShell.tsx"
          ]
        },
        {
          "name": "@radix-ui/react-slot",
          "version": "^1.2.4",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "class-variance-authority",
          "version": "^0.7.1",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "clsx",
          "version": "^2.1.1",
          "files": [
            "src/lib/utils.ts"
          ]
        },
        {
          "name": "tailwind-merge",
          "version": "^3.5.0",
          "files": [
            "src/lib/utils.ts"
          ]
        }
      ],
      "tables": [],
      "rpcs": [],
      "apis": [],
      "migrations": [],
      "authFiles": [],
      "unresolved": [],
      "coupledModules": [],
      "status": "待管理员审核",
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。"
      ]
    },
    {
      "id": "image-tools",
      "name": "图片工具",
      "category": "工具",
      "description": "图片处理与转换。",
      "version": "未单独版本化",
      "entries": [
        "src/components/tools/ImageTool.tsx"
      ],
      "privateFiles": [
        "src/components/tools/ImageTool.tsx",
        "src/lib/tools/ico.ts"
      ],
      "sharedFiles": [
        "src/components/tools/FileDrop.tsx",
        "src/components/tools/ToolShell.tsx",
        "src/components/ui/button.tsx",
        "src/lib/utils.ts"
      ],
      "styles": [],
      "npm": [
        {
          "name": "react",
          "version": "^19.2.0",
          "files": [
            "src/components/tools/FileDrop.tsx",
            "src/components/tools/ImageTool.tsx",
            "src/components/tools/ToolShell.tsx",
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "browser-image-compression",
          "version": "^2.0.2",
          "files": [
            "src/components/tools/ImageTool.tsx"
          ]
        },
        {
          "name": "qrcode",
          "version": "^1.5.4",
          "files": [
            "src/components/tools/ImageTool.tsx"
          ]
        },
        {
          "name": "jsbarcode",
          "version": "^3.12.3",
          "files": [
            "src/components/tools/ImageTool.tsx"
          ]
        },
        {
          "name": "file-saver",
          "version": "^2.0.5",
          "files": [
            "src/components/tools/ImageTool.tsx"
          ]
        },
        {
          "name": "sonner",
          "version": "^2.0.7",
          "files": [
            "src/components/tools/ImageTool.tsx",
            "src/components/tools/ToolShell.tsx"
          ]
        },
        {
          "name": "lucide-react",
          "version": "^0.575.0",
          "files": [
            "src/components/tools/FileDrop.tsx",
            "src/components/tools/ImageTool.tsx",
            "src/components/tools/ToolShell.tsx"
          ]
        },
        {
          "name": "@radix-ui/react-slot",
          "version": "^1.2.4",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "class-variance-authority",
          "version": "^0.7.1",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "clsx",
          "version": "^2.1.1",
          "files": [
            "src/lib/utils.ts"
          ]
        },
        {
          "name": "tailwind-merge",
          "version": "^3.5.0",
          "files": [
            "src/lib/utils.ts"
          ]
        }
      ],
      "tables": [],
      "rpcs": [],
      "apis": [
        {
          "name": "lioneapps.com",
          "files": [
            "src/components/tools/ImageTool.tsx"
          ]
        }
      ],
      "migrations": [],
      "authFiles": [],
      "unresolved": [],
      "coupledModules": [],
      "status": "待管理员审核",
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。"
      ]
    },
    {
      "id": "pdf-tools",
      "name": "PDF 工具",
      "category": "工具",
      "description": "PDF 处理工具组。",
      "version": "未单独版本化",
      "entries": [
        "src/components/tools/PdfTool.tsx"
      ],
      "privateFiles": [
        "src/components/tools/PdfTool.tsx",
        "src/lib/tools/pdfjs.ts"
      ],
      "sharedFiles": [
        "src/components/tools/FileDrop.tsx",
        "src/components/tools/ToolShell.tsx",
        "src/components/ui/button.tsx",
        "src/lib/utils.ts"
      ],
      "styles": [],
      "npm": [
        {
          "name": "react",
          "version": "^19.2.0",
          "files": [
            "src/components/tools/FileDrop.tsx",
            "src/components/tools/PdfTool.tsx",
            "src/components/tools/ToolShell.tsx",
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "pdf-lib",
          "version": "^1.17.1",
          "files": [
            "src/components/tools/PdfTool.tsx"
          ]
        },
        {
          "name": "jszip",
          "version": "^3.10.1",
          "files": [
            "src/components/tools/PdfTool.tsx"
          ]
        },
        {
          "name": "file-saver",
          "version": "^2.0.5",
          "files": [
            "src/components/tools/PdfTool.tsx"
          ]
        },
        {
          "name": "sonner",
          "version": "^2.0.7",
          "files": [
            "src/components/tools/PdfTool.tsx",
            "src/components/tools/ToolShell.tsx"
          ]
        },
        {
          "name": "lucide-react",
          "version": "^0.575.0",
          "files": [
            "src/components/tools/FileDrop.tsx",
            "src/components/tools/PdfTool.tsx",
            "src/components/tools/ToolShell.tsx"
          ]
        },
        {
          "name": "@radix-ui/react-slot",
          "version": "^1.2.4",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "class-variance-authority",
          "version": "^0.7.1",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "clsx",
          "version": "^2.1.1",
          "files": [
            "src/lib/utils.ts"
          ]
        },
        {
          "name": "tailwind-merge",
          "version": "^3.5.0",
          "files": [
            "src/lib/utils.ts"
          ]
        },
        {
          "name": "pdfjs-dist",
          "version": "^6.1.200",
          "files": [
            "src/lib/tools/pdfjs.ts"
          ]
        }
      ],
      "tables": [],
      "rpcs": [],
      "apis": [],
      "migrations": [],
      "authFiles": [],
      "unresolved": [],
      "coupledModules": [],
      "status": "待管理员审核",
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。"
      ]
    },
    {
      "id": "file-hash",
      "name": "文件哈希",
      "category": "工具",
      "description": "文件摘要计算。",
      "version": "未单独版本化",
      "entries": [
        "src/components/tools/FileHashTool.tsx"
      ],
      "privateFiles": [
        "src/components/tools/FileHashTool.tsx"
      ],
      "sharedFiles": [
        "src/components/tools/ToolShell.tsx",
        "src/components/ui/button.tsx",
        "src/components/ui/input.tsx",
        "src/lib/utils.ts"
      ],
      "styles": [],
      "npm": [
        {
          "name": "react",
          "version": "^19.2.0",
          "files": [
            "src/components/tools/FileHashTool.tsx",
            "src/components/tools/ToolShell.tsx",
            "src/components/ui/button.tsx",
            "src/components/ui/input.tsx"
          ]
        },
        {
          "name": "spark-md5",
          "version": "^3.0.2",
          "files": [
            "src/components/tools/FileHashTool.tsx"
          ]
        },
        {
          "name": "lucide-react",
          "version": "^0.575.0",
          "files": [
            "src/components/tools/ToolShell.tsx"
          ]
        },
        {
          "name": "sonner",
          "version": "^2.0.7",
          "files": [
            "src/components/tools/ToolShell.tsx"
          ]
        },
        {
          "name": "@radix-ui/react-slot",
          "version": "^1.2.4",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "class-variance-authority",
          "version": "^0.7.1",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "clsx",
          "version": "^2.1.1",
          "files": [
            "src/lib/utils.ts"
          ]
        },
        {
          "name": "tailwind-merge",
          "version": "^3.5.0",
          "files": [
            "src/lib/utils.ts"
          ]
        }
      ],
      "tables": [],
      "rpcs": [],
      "apis": [],
      "migrations": [],
      "authFiles": [],
      "unresolved": [],
      "coupledModules": [],
      "status": "待管理员审核",
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。"
      ]
    },
    {
      "id": "network-tools",
      "name": "网络工具",
      "category": "工具",
      "description": "网络查询工具与服务调用。",
      "version": "未单独版本化",
      "entries": [
        "src/components/tools/NetworkTool.tsx"
      ],
      "privateFiles": [
        "src/components/tools/NetworkTool.tsx",
        "src/lib/network.functions.ts"
      ],
      "sharedFiles": [
        "src/components/tools/LookupTool.tsx",
        "src/components/tools/ToolShell.tsx",
        "src/components/ui/button.tsx",
        "src/lib/utils.ts"
      ],
      "styles": [],
      "npm": [
        {
          "name": "react",
          "version": "^19.2.0",
          "files": [
            "src/components/tools/LookupTool.tsx",
            "src/components/tools/NetworkTool.tsx",
            "src/components/tools/ToolShell.tsx",
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "ua-parser-js",
          "version": "^2.0.10",
          "files": [
            "src/components/tools/NetworkTool.tsx"
          ]
        },
        {
          "name": "lucide-react",
          "version": "^0.575.0",
          "files": [
            "src/components/tools/LookupTool.tsx",
            "src/components/tools/ToolShell.tsx"
          ]
        },
        {
          "name": "sonner",
          "version": "^2.0.7",
          "files": [
            "src/components/tools/LookupTool.tsx",
            "src/components/tools/ToolShell.tsx"
          ]
        },
        {
          "name": "@radix-ui/react-slot",
          "version": "^1.2.4",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "class-variance-authority",
          "version": "^0.7.1",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "clsx",
          "version": "^2.1.1",
          "files": [
            "src/lib/utils.ts"
          ]
        },
        {
          "name": "tailwind-merge",
          "version": "^3.5.0",
          "files": [
            "src/lib/utils.ts"
          ]
        },
        {
          "name": "@tanstack/react-start",
          "version": "1.168.60",
          "files": [
            "src/lib/network.functions.ts"
          ]
        }
      ],
      "tables": [],
      "rpcs": [],
      "apis": [
        {
          "name": "lioneapps.com",
          "files": [
            "src/components/tools/NetworkTool.tsx"
          ]
        },
        {
          "name": "ipwho.is",
          "files": [
            "src/lib/network.functions.ts"
          ]
        },
        {
          "name": "rdap.org",
          "files": [
            "src/lib/network.functions.ts"
          ]
        },
        {
          "name": "cloudflare-dns.com",
          "files": [
            "src/lib/network.functions.ts"
          ]
        },
        {
          "name": "ssl-checker.io",
          "files": [
            "src/lib/network.functions.ts"
          ]
        }
      ],
      "migrations": [],
      "authFiles": [],
      "unresolved": [],
      "coupledModules": [
        "lookup-tools"
      ],
      "status": "待管理员审核",
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。"
      ]
    },
    {
      "id": "lookup-tools",
      "name": "查询工具",
      "category": "工具",
      "description": "信息查询工具组。",
      "version": "未单独版本化",
      "entries": [
        "src/components/tools/LookupTool.tsx"
      ],
      "privateFiles": [],
      "sharedFiles": [
        "src/components/tools/LookupTool.tsx",
        "src/components/tools/ToolShell.tsx",
        "src/components/ui/button.tsx",
        "src/lib/utils.ts"
      ],
      "styles": [],
      "npm": [
        {
          "name": "react",
          "version": "^19.2.0",
          "files": [
            "src/components/tools/LookupTool.tsx",
            "src/components/tools/ToolShell.tsx",
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "lucide-react",
          "version": "^0.575.0",
          "files": [
            "src/components/tools/LookupTool.tsx",
            "src/components/tools/ToolShell.tsx"
          ]
        },
        {
          "name": "sonner",
          "version": "^2.0.7",
          "files": [
            "src/components/tools/LookupTool.tsx",
            "src/components/tools/ToolShell.tsx"
          ]
        },
        {
          "name": "@radix-ui/react-slot",
          "version": "^1.2.4",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "class-variance-authority",
          "version": "^0.7.1",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "clsx",
          "version": "^2.1.1",
          "files": [
            "src/lib/utils.ts"
          ]
        },
        {
          "name": "tailwind-merge",
          "version": "^3.5.0",
          "files": [
            "src/lib/utils.ts"
          ]
        }
      ],
      "tables": [],
      "rpcs": [],
      "apis": [],
      "migrations": [],
      "authFiles": [],
      "unresolved": [],
      "coupledModules": [],
      "status": "待管理员审核",
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。"
      ]
    },
    {
      "id": "time-tools",
      "name": "时间工具",
      "category": "工具",
      "description": "时间处理工具组。",
      "version": "未单独版本化",
      "entries": [
        "src/components/tools/TimeTool.tsx"
      ],
      "privateFiles": [
        "src/components/tools/TimeTool.tsx"
      ],
      "sharedFiles": [
        "src/components/tools/ToolShell.tsx",
        "src/components/ui/button.tsx",
        "src/components/ui/input.tsx",
        "src/lib/utils.ts"
      ],
      "styles": [],
      "npm": [
        {
          "name": "react",
          "version": "^19.2.0",
          "files": [
            "src/components/tools/TimeTool.tsx",
            "src/components/tools/ToolShell.tsx",
            "src/components/ui/button.tsx",
            "src/components/ui/input.tsx"
          ]
        },
        {
          "name": "lucide-react",
          "version": "^0.575.0",
          "files": [
            "src/components/tools/ToolShell.tsx"
          ]
        },
        {
          "name": "sonner",
          "version": "^2.0.7",
          "files": [
            "src/components/tools/ToolShell.tsx"
          ]
        },
        {
          "name": "@radix-ui/react-slot",
          "version": "^1.2.4",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "class-variance-authority",
          "version": "^0.7.1",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "clsx",
          "version": "^2.1.1",
          "files": [
            "src/lib/utils.ts"
          ]
        },
        {
          "name": "tailwind-merge",
          "version": "^3.5.0",
          "files": [
            "src/lib/utils.ts"
          ]
        }
      ],
      "tables": [],
      "rpcs": [],
      "apis": [],
      "migrations": [],
      "authFiles": [],
      "unresolved": [],
      "coupledModules": [],
      "status": "待管理员审核",
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。"
      ]
    },
    {
      "id": "simple-tools",
      "name": "通用实用工具",
      "category": "工具",
      "description": "现有简易工具集合。",
      "version": "未单独版本化",
      "entries": [
        "src/components/tools/SimpleTool.tsx"
      ],
      "privateFiles": [
        "src/components/tools/SimpleTool.tsx"
      ],
      "sharedFiles": [
        "src/components/tools/ToolShell.tsx",
        "src/components/ui/button.tsx",
        "src/components/ui/input.tsx",
        "src/lib/utils.ts"
      ],
      "styles": [],
      "npm": [
        {
          "name": "react",
          "version": "^19.2.0",
          "files": [
            "src/components/tools/SimpleTool.tsx",
            "src/components/tools/ToolShell.tsx",
            "src/components/ui/button.tsx",
            "src/components/ui/input.tsx"
          ]
        },
        {
          "name": "lucide-react",
          "version": "^0.575.0",
          "files": [
            "src/components/tools/ToolShell.tsx"
          ]
        },
        {
          "name": "sonner",
          "version": "^2.0.7",
          "files": [
            "src/components/tools/ToolShell.tsx"
          ]
        },
        {
          "name": "@radix-ui/react-slot",
          "version": "^1.2.4",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "class-variance-authority",
          "version": "^0.7.1",
          "files": [
            "src/components/ui/button.tsx"
          ]
        },
        {
          "name": "clsx",
          "version": "^2.1.1",
          "files": [
            "src/lib/utils.ts"
          ]
        },
        {
          "name": "tailwind-merge",
          "version": "^3.5.0",
          "files": [
            "src/lib/utils.ts"
          ]
        }
      ],
      "tables": [],
      "rpcs": [],
      "apis": [
        {
          "name": "api.zippopotam.us",
          "files": [
            "src/components/tools/SimpleTool.tsx"
          ]
        }
      ],
      "migrations": [],
      "authFiles": [],
      "unresolved": [],
      "coupledModules": [],
      "status": "待管理员审核",
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。"
      ]
    }
  ]
};
