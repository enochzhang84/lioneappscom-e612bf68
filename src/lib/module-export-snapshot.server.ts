// Generated offline. Metadata only.
import type { ExportSnapshot } from './module-export.types';
export const exportSnapshot: ExportSnapshot = {
  "generatedAt": "2026-10-21T18:50:17.836Z",
  "modules": [
    {
      "id": "calculator",
      "name": "计算器中心",
      "version": "0.0.0-source-snapshot",
      "digest": "84ab480e6e4bb42832a57c0db9422f9df891bf1a8a8456f10289acec6149757f",
      "bytes": 30317,
      "files": [
        {
          "path": "src/components/calculator/Calculator.tsx",
          "sourcePath": "src/components/calculator/Calculator.tsx",
          "kind": "shared",
          "bytes": 9398,
          "sha256": "1a719d0a0beb4199dc8092c45ea73e1ed517f50d28b9900096d38c3c13d05206"
        },
        {
          "path": "src/components/ui/button.tsx",
          "sourcePath": "src/components/ui/button.tsx",
          "kind": "shared",
          "bytes": 1894,
          "sha256": "e39813b666ba434660ec088356a0349246b6803a4e99961295d0c82bab1ab862"
        },
        {
          "path": "src/components/ui/input.tsx",
          "sourcePath": "src/components/ui/input.tsx",
          "kind": "shared",
          "bytes": 776,
          "sha256": "92debb7d6d2d96d9e607a42d5ce8f37b2d63384ae5dd9ffbbf5f047b680ffb85"
        },
        {
          "path": "src/lib/calculators/automotive.ts",
          "sourcePath": "src/lib/calculators/automotive.ts",
          "kind": "shared",
          "bytes": 2541,
          "sha256": "358ba31e97bf15e6070b1a8edc7591c2b5a5f8d20afe3708621083c8e211d117"
        },
        {
          "path": "src/lib/calculators/decoration.ts",
          "sourcePath": "src/lib/calculators/decoration.ts",
          "kind": "shared",
          "bytes": 7566,
          "sha256": "06fe9165953f422f29ce3e064d6006cc13a19c643d32325b8094ff5cbb14185e"
        },
        {
          "path": "src/lib/calculators/finance.ts",
          "sourcePath": "src/lib/calculators/finance.ts",
          "kind": "shared",
          "bytes": 14072,
          "sha256": "1b7e5d3b99bb16fc9e0b0bc3302fde39f873f5e8dc7bea4a7108cda6c084140d"
        },
        {
          "path": "src/lib/calculators/health.ts",
          "sourcePath": "src/lib/calculators/health.ts",
          "kind": "shared",
          "bytes": 8472,
          "sha256": "8575f3427956fd2d85544711b4ca08eda2b7b7128e28057e05b256a9a8fb78ba"
        },
        {
          "path": "src/lib/calculators/index.ts",
          "sourcePath": "src/lib/calculators/index.ts",
          "kind": "shared",
          "bytes": 819,
          "sha256": "030ab3475b9ce006a4f5f04ff60e670e62f08f41791bdf749fb901cb92c3ca79"
        },
        {
          "path": "src/lib/calculators/logistics.ts",
          "sourcePath": "src/lib/calculators/logistics.ts",
          "kind": "shared",
          "bytes": 5347,
          "sha256": "4174507cbbcb52dcf861c8c280fe4a2fc4232715619072350dec0c7bf4281b4c"
        },
        {
          "path": "src/lib/calculators/nas.ts",
          "sourcePath": "src/lib/calculators/nas.ts",
          "kind": "shared",
          "bytes": 5835,
          "sha256": "935aeb14e1b5b2dd7486c0c0278d13e2dc4828231ff0b62ddc75fd630cf96feb"
        },
        {
          "path": "src/lib/calculators/types.ts",
          "sourcePath": "src/lib/calculators/types.ts",
          "kind": "shared",
          "bytes": 1180,
          "sha256": "bb7ddab8c875ef5e06e345f4f1ca197467ba463771429ef97dba4d4a9e9e9038"
        },
        {
          "path": "src/lib/calculators/usa.ts",
          "sourcePath": "src/lib/calculators/usa.ts",
          "kind": "shared",
          "bytes": 3567,
          "sha256": "07693c4aff5b17caf2867db3e7555302e7f08c55cb796ed10670ac9a32ca2424"
        },
        {
          "path": "src/lib/utils.ts",
          "sourcePath": "src/lib/utils.ts",
          "kind": "shared",
          "bytes": 169,
          "sha256": "d1f1e0d62cb8d8d1e04c26e14de842d8a151f75812d81b046c65b5d1fe8e4b27"
        },
        {
          "path": "src/styles.css",
          "sourcePath": "src/styles.css",
          "kind": "shared",
          "bytes": 5655,
          "sha256": "29f12b25c7c28934469eaf4924edc1ff43e31d36cbf7b1314ef36351c850e99f"
        }
      ],
      "excluded": [],
      "errors": [],
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。",
        "这是实际源代码审查包，不是已验证的独立可安装插件；installable 始终为 false。",
        "源文件按原路径包含；资产保留 src/assets 相对位置以避免破坏引用。",
        "静态敏感信息筛查不是完整安全审计；动态资产、外部服务及目标平台权限需要人工核对。"
      ],
      "cycles": [],
      "configuration": [],
      "dependencies": [
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
      "database": [],
      "installable": false,
      "canExport": true
    },
    {
      "id": "converter",
      "name": "单位换算",
      "version": "0.0.0-source-snapshot",
      "digest": "f4c27cf13fa7edfc16de00fdd0ea85f8051bc6339a451b6062141f9ab7531b13",
      "bytes": 29954,
      "files": [
        {
          "path": "src/components/converter/UnitConverter.tsx",
          "sourcePath": "src/components/converter/UnitConverter.tsx",
          "kind": "shared",
          "bytes": 8556,
          "sha256": "299c9e703f7b1112606a81aec0cdeb7afaae82c1372fd4e35d6768a11e0d9c93"
        },
        {
          "path": "src/components/ui/button.tsx",
          "sourcePath": "src/components/ui/button.tsx",
          "kind": "shared",
          "bytes": 1894,
          "sha256": "e39813b666ba434660ec088356a0349246b6803a4e99961295d0c82bab1ab862"
        },
        {
          "path": "src/components/ui/input.tsx",
          "sourcePath": "src/components/ui/input.tsx",
          "kind": "shared",
          "bytes": 776,
          "sha256": "92debb7d6d2d96d9e607a42d5ce8f37b2d63384ae5dd9ffbbf5f047b680ffb85"
        },
        {
          "path": "src/lib/converters/area.ts",
          "sourcePath": "src/lib/converters/area.ts",
          "kind": "shared",
          "bytes": 2276,
          "sha256": "1ac5e8fd11b032adcebd46f058ee4761ac1ff81250ce7198cdf0de7b01f212ba"
        },
        {
          "path": "src/lib/converters/fuel.ts",
          "sourcePath": "src/lib/converters/fuel.ts",
          "kind": "shared",
          "bytes": 1921,
          "sha256": "24afb3ed2639b3bc527b7629d13ee8bc01aef323a65719c6d5d1f8a465a28215"
        },
        {
          "path": "src/lib/converters/index.ts",
          "sourcePath": "src/lib/converters/index.ts",
          "kind": "shared",
          "bytes": 1266,
          "sha256": "1707146b17f5c3edfa33f6f1325c6a74132f3a3690b8a9c43bce1be995526a7f"
        },
        {
          "path": "src/lib/converters/length.ts",
          "sourcePath": "src/lib/converters/length.ts",
          "kind": "shared",
          "bytes": 3098,
          "sha256": "df3a1f2bb5fd1498ec69fc49ad2849bd13e8469ec08277fbcffd59af46e35676"
        },
        {
          "path": "src/lib/converters/number.ts",
          "sourcePath": "src/lib/converters/number.ts",
          "kind": "shared",
          "bytes": 2098,
          "sha256": "3cbbb015655359d0782e1986458e138307a44407db0bc66df4e72bc82fc3a7c7"
        },
        {
          "path": "src/lib/converters/power.ts",
          "sourcePath": "src/lib/converters/power.ts",
          "kind": "shared",
          "bytes": 1977,
          "sha256": "8fa0fa68161c32de70d5032245dec676c400d55490a77ef53fce5e7869258e5c"
        },
        {
          "path": "src/lib/converters/pressure.ts",
          "sourcePath": "src/lib/converters/pressure.ts",
          "kind": "shared",
          "bytes": 1860,
          "sha256": "6052463630dfe27c90f2dbc098c7f992b95de1b122e5e7e2088192db4ff7b95f"
        },
        {
          "path": "src/lib/converters/speed.ts",
          "sourcePath": "src/lib/converters/speed.ts",
          "kind": "shared",
          "bytes": 1638,
          "sha256": "a3e0db881b658fdcd9ee2321f147136e38d5b2441e1b3e105f1409b7e2df641a"
        },
        {
          "path": "src/lib/converters/storage.ts",
          "sourcePath": "src/lib/converters/storage.ts",
          "kind": "shared",
          "bytes": 1888,
          "sha256": "e64de03fbc0b871ca75575ed5f4422e0887b69e5e0a4bd6500589d9507d62f2e"
        },
        {
          "path": "src/lib/converters/temperature.ts",
          "sourcePath": "src/lib/converters/temperature.ts",
          "kind": "shared",
          "bytes": 2269,
          "sha256": "8c5efd736d61f4b5f18ceeb403eb463d70cd1701896b76ea4a10cb1f575210c6"
        },
        {
          "path": "src/lib/converters/types.ts",
          "sourcePath": "src/lib/converters/types.ts",
          "kind": "shared",
          "bytes": 1358,
          "sha256": "b657932d617a0250e229908f7404911c1fda904e4e2233424ddb9058a3f5af10"
        },
        {
          "path": "src/lib/converters/units.ts",
          "sourcePath": "src/lib/converters/units.ts",
          "kind": "shared",
          "bytes": 8643,
          "sha256": "7322c70904e2b3fd3e9d1287f666f8699fbfb8dd88dde6b27ab134284d7e0391"
        },
        {
          "path": "src/lib/converters/volume.ts",
          "sourcePath": "src/lib/converters/volume.ts",
          "kind": "shared",
          "bytes": 2520,
          "sha256": "670a93f4754ff03b299b7ad28994f06075cf0d0406b2938475bd9fa97cdc6005"
        },
        {
          "path": "src/lib/converters/weight.ts",
          "sourcePath": "src/lib/converters/weight.ts",
          "kind": "shared",
          "bytes": 2119,
          "sha256": "558caa719a933d34ecd9d2d317feea4d26d09d2a96ca0b328e21a44e62789637"
        },
        {
          "path": "src/lib/utils.ts",
          "sourcePath": "src/lib/utils.ts",
          "kind": "shared",
          "bytes": 169,
          "sha256": "d1f1e0d62cb8d8d1e04c26e14de842d8a151f75812d81b046c65b5d1fe8e4b27"
        },
        {
          "path": "src/styles.css",
          "sourcePath": "src/styles.css",
          "kind": "shared",
          "bytes": 5655,
          "sha256": "29f12b25c7c28934469eaf4924edc1ff43e31d36cbf7b1314ef36351c850e99f"
        }
      ],
      "excluded": [],
      "errors": [],
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。",
        "这是实际源代码审查包，不是已验证的独立可安装插件；installable 始终为 false。",
        "源文件按原路径包含；资产保留 src/assets 相对位置以避免破坏引用。",
        "静态敏感信息筛查不是完整安全审计；动态资产、外部服务及目标平台权限需要人工核对。"
      ],
      "cycles": [],
      "configuration": [],
      "dependencies": [
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
      "database": [],
      "installable": false,
      "canExport": true
    },
    {
      "id": "currency",
      "name": "汇率换算",
      "version": "0.0.0-source-snapshot",
      "digest": "9b3acc5f479ff78dce82202d3c847ebd04f5ca2b07e36ef0c44bc04b0ed92977",
      "bytes": 12926,
      "files": [
        {
          "path": "src/components/currency/CurrencyConverter.tsx",
          "sourcePath": "src/components/currency/CurrencyConverter.tsx",
          "kind": "private",
          "bytes": 13745,
          "sha256": "18933c6e5984bbd509da0ce71e17eadd8a1a74625d4dfff79768f0931ec7c7f5"
        },
        {
          "path": "src/components/ui/button.tsx",
          "sourcePath": "src/components/ui/button.tsx",
          "kind": "shared",
          "bytes": 1894,
          "sha256": "e39813b666ba434660ec088356a0349246b6803a4e99961295d0c82bab1ab862"
        },
        {
          "path": "src/components/ui/input.tsx",
          "sourcePath": "src/components/ui/input.tsx",
          "kind": "shared",
          "bytes": 776,
          "sha256": "92debb7d6d2d96d9e607a42d5ce8f37b2d63384ae5dd9ffbbf5f047b680ffb85"
        },
        {
          "path": "src/lib/utils.ts",
          "sourcePath": "src/lib/utils.ts",
          "kind": "shared",
          "bytes": 169,
          "sha256": "d1f1e0d62cb8d8d1e04c26e14de842d8a151f75812d81b046c65b5d1fe8e4b27"
        },
        {
          "path": "src/styles.css",
          "sourcePath": "src/styles.css",
          "kind": "shared",
          "bytes": 5655,
          "sha256": "29f12b25c7c28934469eaf4924edc1ff43e31d36cbf7b1314ef36351c850e99f"
        }
      ],
      "excluded": [],
      "errors": [],
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。",
        "依赖外部查询服务可用性与跨域访问；需在目标平台验证。",
        "这是实际源代码审查包，不是已验证的独立可安装插件；installable 始终为 false。",
        "源文件按原路径包含；资产保留 src/assets 相对位置以避免破坏引用。",
        "静态敏感信息筛查不是完整安全审计；动态资产、外部服务及目标平台权限需要人工核对。"
      ],
      "cycles": [],
      "configuration": [],
      "dependencies": [
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
      "database": [],
      "installable": false,
      "canExport": true
    },
    {
      "id": "bible",
      "name": "圣经阅读器",
      "version": "0.0.0-source-snapshot",
      "digest": "39c63adb1700ac0cfe3db5a8366484cb475dcde1568c488b2aa6a727ef8aac8a",
      "bytes": 13370,
      "files": [
        {
          "path": "src/components/bible/BibleCUNP.tsx",
          "sourcePath": "src/components/bible/BibleCUNP.tsx",
          "kind": "private",
          "bytes": 1833,
          "sha256": "bdcd39dc559c47f827db424b91dd63e86c0223fef6d41533d708f0b078fbb931"
        },
        {
          "path": "src/components/bible/BibleCUV.tsx",
          "sourcePath": "src/components/bible/BibleCUV.tsx",
          "kind": "private",
          "bytes": 1834,
          "sha256": "8ca9329866b962a4932392ced8fb88fd3143eebec2020760a0e6e801105e97af"
        },
        {
          "path": "src/components/bible/BibleKJV.tsx",
          "sourcePath": "src/components/bible/BibleKJV.tsx",
          "kind": "private",
          "bytes": 1550,
          "sha256": "c1e291211f1f55e2be146a4a3a81c5bbc867131f9b0454c44065c66cd60d0b24"
        },
        {
          "path": "src/components/bible/BibleReader.tsx",
          "sourcePath": "src/components/bible/BibleReader.tsx",
          "kind": "private",
          "bytes": 7099,
          "sha256": "16fa4a0f31278120b76a7bac95d823475734c68cad9b62d3e50037cdb25b98b5"
        },
        {
          "path": "src/components/ui/button.tsx",
          "sourcePath": "src/components/ui/button.tsx",
          "kind": "shared",
          "bytes": 1894,
          "sha256": "e39813b666ba434660ec088356a0349246b6803a4e99961295d0c82bab1ab862"
        },
        {
          "path": "src/lib/utils.ts",
          "sourcePath": "src/lib/utils.ts",
          "kind": "shared",
          "bytes": 169,
          "sha256": "d1f1e0d62cb8d8d1e04c26e14de842d8a151f75812d81b046c65b5d1fe8e4b27"
        },
        {
          "path": "src/styles.css",
          "sourcePath": "src/styles.css",
          "kind": "shared",
          "bytes": 5655,
          "sha256": "29f12b25c7c28934469eaf4924edc1ff43e31d36cbf7b1314ef36351c850e99f"
        }
      ],
      "excluded": [],
      "errors": [],
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。",
        "依赖外部查询服务可用性与跨域访问；需在目标平台验证。",
        "这是实际源代码审查包，不是已验证的独立可安装插件；installable 始终为 false。",
        "源文件按原路径包含；资产保留 src/assets 相对位置以避免破坏引用。",
        "静态敏感信息筛查不是完整安全审计；动态资产、外部服务及目标平台权限需要人工核对。"
      ],
      "cycles": [],
      "configuration": [],
      "dependencies": [
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
      "database": [],
      "installable": false,
      "canExport": true
    },
    {
      "id": "c1-exam",
      "name": "C1 模拟考试",
      "version": "0.0.0-source-snapshot",
      "digest": "4c9c959d99a6448f9c0a83725b1ebc19c5de7dc562de1b54a306cbcb2bae9a0a",
      "bytes": 1076899,
      "files": [
        {
          "path": "src/assets/service-business-platforms.jpg",
          "sourcePath": "src/assets/service-business-platforms.jpg",
          "kind": "asset",
          "bytes": 140119,
          "sha256": "4733e025a724357656c376b61adfa2f7ff4d7575708936c99170fe73ec32e96a"
        },
        {
          "path": "src/assets/service-cloud-deployment.jpg",
          "sourcePath": "src/assets/service-cloud-deployment.jpg",
          "kind": "asset",
          "bytes": 137121,
          "sha256": "09e7a5f28857547a68f15211f1484d98b5a813a4b46e67b2a43da99585462f04"
        },
        {
          "path": "src/assets/service-custom-software.jpg",
          "sourcePath": "src/assets/service-custom-software.jpg",
          "kind": "asset",
          "bytes": 131429,
          "sha256": "94d6fc2e364c17e9162ff5977d79ac08c06d691820388fc9e5ab7871f008b576"
        },
        {
          "path": "src/assets/service-home-media.jpg",
          "sourcePath": "src/assets/service-home-media.jpg",
          "kind": "asset",
          "bytes": 153051,
          "sha256": "5ab29a1cd169fbdc917f713d59cd543cd81f976982ddaf8a718d3fe5380871c9"
        },
        {
          "path": "src/assets/service-home-network.jpg",
          "sourcePath": "src/assets/service-home-network.jpg",
          "kind": "asset",
          "bytes": 136120,
          "sha256": "bba6cf864bd2a22c5533320e29a9ce2104c34799833c885885d29b4d4e43e4dc"
        },
        {
          "path": "src/assets/service-nas.jpg",
          "sourcePath": "src/assets/service-nas.jpg",
          "kind": "asset",
          "bytes": 147867,
          "sha256": "d0761bb6777ca8537bc80096818aae86833ab29ae06bb071c07062122f3e8a7f"
        },
        {
          "path": "src/assets/service-smart-home.jpg",
          "sourcePath": "src/assets/service-smart-home.jpg",
          "kind": "asset",
          "bytes": 123936,
          "sha256": "e6b54101a27c481fe46dbacf71738c07e9174e36acbae64ff4ee66b545338ba8"
        },
        {
          "path": "src/assets/service-websites.jpg",
          "sourcePath": "src/assets/service-websites.jpg",
          "kind": "asset",
          "bytes": 165323,
          "sha256": "c925841def888e21a5007873612a45cdadc8806c7176638f9e40ac0b60882029"
        },
        {
          "path": "src/components/exam/C1MockExamHub.tsx",
          "sourcePath": "src/components/exam/C1MockExamHub.tsx",
          "kind": "private",
          "bytes": 3895,
          "sha256": "1852dd930777d1310bea8a72ec8a8e546f71e1f13274e4eff3a514c49a8a6dc6"
        },
        {
          "path": "src/components/exam/ExamOptionList.tsx",
          "sourcePath": "src/components/exam/ExamOptionList.tsx",
          "kind": "shared",
          "bytes": 4094,
          "sha256": "c878afbde49a58b63d04deffa432a26dd2ca85f3c03cc713aade33c753f789ca"
        },
        {
          "path": "src/components/ui/button.tsx",
          "sourcePath": "src/components/ui/button.tsx",
          "kind": "shared",
          "bytes": 1894,
          "sha256": "e39813b666ba434660ec088356a0349246b6803a4e99961295d0c82bab1ab862"
        },
        {
          "path": "src/components/ui/card.tsx",
          "sourcePath": "src/components/ui/card.tsx",
          "kind": "shared",
          "bytes": 1817,
          "sha256": "f13878a0078a5ef9f3e92af29259fc1e93ea56ea80cb992e0c4dea4e35396459"
        },
        {
          "path": "src/components/ui/dialog.tsx",
          "sourcePath": "src/components/ui/dialog.tsx",
          "kind": "shared",
          "bytes": 3648,
          "sha256": "e3a6de153fb15597ea95be9c4549211a297c060267787915599e3d680d476bd9"
        },
        {
          "path": "src/components/ui/input.tsx",
          "sourcePath": "src/components/ui/input.tsx",
          "kind": "shared",
          "bytes": 776,
          "sha256": "92debb7d6d2d96d9e607a42d5ce8f37b2d63384ae5dd9ffbbf5f047b680ffb85"
        },
        {
          "path": "src/components/ui/label.tsx",
          "sourcePath": "src/components/ui/label.tsx",
          "kind": "shared",
          "bytes": 716,
          "sha256": "9f72e2ecf16206593aa9e3c4fbc14cd8e81aa8488d57d92d4a950b30935a9fa9"
        },
        {
          "path": "src/components/ui/navigation-menu.tsx",
          "sourcePath": "src/components/ui/navigation-menu.tsx",
          "kind": "shared",
          "bytes": 5152,
          "sha256": "755aecc77b7911ab61159c9fbb9b25254009eb4c32c95b1430b6b5b7d37ed8f0"
        },
        {
          "path": "src/components/ui/sheet.tsx",
          "sourcePath": "src/components/ui/sheet.tsx",
          "kind": "shared",
          "bytes": 4248,
          "sha256": "a82f9341962e766ee925a2fe883b0a9ab5d5dd8475c402ac8e491ee37dc95fde"
        },
        {
          "path": "src/components/ui/sonner.tsx",
          "sourcePath": "src/components/ui/sonner.tsx",
          "kind": "shared",
          "bytes": 734,
          "sha256": "3ad40f66c339e799b1a57c00e10b4627294c7d580d99d8a48ae0d8d4c13cf931"
        },
        {
          "path": "src/hooks/use-auth.ts",
          "sourcePath": "src/hooks/use-auth.ts",
          "kind": "private",
          "bytes": 706,
          "sha256": "9c2aeec8d472f771f2dc39db3134642cc76d30ddba5225bf18a8e01624043860"
        },
        {
          "path": "src/lib/ai-knowledge.functions.ts",
          "sourcePath": "src/lib/ai-knowledge.functions.ts",
          "kind": "private",
          "bytes": 19408,
          "sha256": "220e29e0c2143f9519e8c1dcd6b3afb57a4aaf7f21e68122d0774608aef347e3"
        },
        {
          "path": "src/lib/ai-quota.functions.ts",
          "sourcePath": "src/lib/ai-quota.functions.ts",
          "kind": "private",
          "bytes": 4096,
          "sha256": "a12c15237af6224bf423de01f0bfa06ab4c4cbb1024c9a30e42ad50a7687a71b"
        },
        {
          "path": "src/lib/cms.functions.ts",
          "sourcePath": "src/lib/cms.functions.ts",
          "kind": "shared",
          "bytes": 9457,
          "sha256": "0a9390bc00c78f23850bc6909946f54d3f4b461df56f70f090e866ed4db1db1d"
        },
        {
          "path": "src/lib/i18n.tsx",
          "sourcePath": "src/lib/i18n.tsx",
          "kind": "shared",
          "bytes": 12454,
          "sha256": "15d6ec8a275563b5578c5a65d060b22b25879bb4f269baba6597c924453a2697"
        },
        {
          "path": "src/lib/platform-bootstrap.tsx",
          "sourcePath": "src/lib/platform-bootstrap.tsx",
          "kind": "shared",
          "bytes": 2943,
          "sha256": "d73032adeff5e437abfe228493afaccee42ba374f9e7d63a2e09687be8283a43"
        },
        {
          "path": "src/lib/quiz.functions.ts",
          "sourcePath": "src/lib/quiz.functions.ts",
          "kind": "shared",
          "bytes": 14800,
          "sha256": "f1c05840490ee36ad63eb0ee7695b8abb1db9b857e66d6ff126a6bfd8de9909b"
        },
        {
          "path": "src/lib/services-data.ts",
          "sourcePath": "src/lib/services-data.ts",
          "kind": "shared",
          "bytes": 16228,
          "sha256": "626b414329846937b859c9244df323b968aabf431f0c1cf84cf3683e5bccb676"
        },
        {
          "path": "src/lib/translate.functions.ts",
          "sourcePath": "src/lib/translate.functions.ts",
          "kind": "private",
          "bytes": 2458,
          "sha256": "52aa3fcef1710b6253dc3fc1fabeae86f9e3f992941249ab55f4641ea15a9c4a"
        },
        {
          "path": "src/lib/utils.ts",
          "sourcePath": "src/lib/utils.ts",
          "kind": "shared",
          "bytes": 169,
          "sha256": "d1f1e0d62cb8d8d1e04c26e14de842d8a151f75812d81b046c65b5d1fe8e4b27"
        },
        {
          "path": "src/routes/p.drive.c1.tsx",
          "sourcePath": "src/routes/p.drive.c1.tsx",
          "kind": "private",
          "bytes": 96476,
          "sha256": "5c1f349baaecfd6b62e178e8c8b65f537ff9b33923221a2d051bbe7a154407a3"
        },
        {
          "path": "src/styles.css",
          "sourcePath": "src/styles.css",
          "kind": "shared",
          "bytes": 5655,
          "sha256": "29f12b25c7c28934469eaf4924edc1ff43e31d36cbf7b1314ef36351c850e99f"
        },
        {
          "path": "database/migrations/20260605025102_b5a1855f-984a-411a-a705-bf46012dc5b6.sql",
          "sourcePath": "supabase/migrations/20260605025102_b5a1855f-984a-411a-a705-bf46012dc5b6.sql",
          "kind": "migration",
          "bytes": 4351,
          "sha256": "12798c573bd36ceabed75e19294cf4e6f0550babe09b4aba18a1d598ca7fba08"
        },
        {
          "path": "database/migrations/20260605025137_857d9b46-525b-4a9e-8754-8b1ea06ffc5f.sql",
          "sourcePath": "supabase/migrations/20260605025137_857d9b46-525b-4a9e-8754-8b1ea06ffc5f.sql",
          "kind": "migration",
          "bytes": 245,
          "sha256": "07c0291829a5c4326ee1b870e816a6554d58becba307d3c76f7a306e053319dd"
        },
        {
          "path": "database/migrations/20260605041915_f2084296-4115-4972-9522-4f2f8b6d2663.sql",
          "sourcePath": "supabase/migrations/20260605041915_f2084296-4115-4972-9522-4f2f8b6d2663.sql",
          "kind": "migration",
          "bytes": 1751,
          "sha256": "39fc2b66002fc13c63e8bae428083c82fd48d54c1cac5278d35832eb46027a7d"
        },
        {
          "path": "database/migrations/20260605042145_9830a646-87e5-4bb2-9cba-3b95566dffee.sql",
          "sourcePath": "supabase/migrations/20260605042145_9830a646-87e5-4bb2-9cba-3b95566dffee.sql",
          "kind": "migration",
          "bytes": 576,
          "sha256": "ab5cfaaa796d5926325ae92b53c16c2013ec508792c3e6de9a5ec51721435fef"
        },
        {
          "path": "database/migrations/20260701150020_80a3f5d8-f7c2-4c48-a7a7-2167b418c679.sql",
          "sourcePath": "supabase/migrations/20260701150020_80a3f5d8-f7c2-4c48-a7a7-2167b418c679.sql",
          "kind": "migration",
          "bytes": 1230,
          "sha256": "7b4cc4a4686b122a11bbaf7093c33971a0ae7c8461b937d421544df46b93a14d"
        },
        {
          "path": "database/migrations/20260701155726_58964244-bc02-4244-8029-cb2bbb228957.sql",
          "sourcePath": "supabase/migrations/20260701155726_58964244-bc02-4244-8029-cb2bbb228957.sql",
          "kind": "migration",
          "bytes": 2995,
          "sha256": "10d64474d4de50d5940192d7398a8e1982a5b94c69248415452e9fb303fb8a19"
        },
        {
          "path": "database/migrations/20260701161506_bf4d7def-5e05-41ba-84d7-4e99337f4f76.sql",
          "sourcePath": "supabase/migrations/20260701161506_bf4d7def-5e05-41ba-84d7-4e99337f4f76.sql",
          "kind": "migration",
          "bytes": 117,
          "sha256": "47770537c164a2f9a959362fc63abfa2c2d00c46d01aca532f868848faf15383"
        },
        {
          "path": "database/migrations/20260701200509_6225bdc7-d2b4-4fb7-b94d-3eed26d19051.sql",
          "sourcePath": "supabase/migrations/20260701200509_6225bdc7-d2b4-4fb7-b94d-3eed26d19051.sql",
          "kind": "migration",
          "bytes": 65,
          "sha256": "8c3732a1a7dea2a787bd77f8ccfad29dfa5ab6170c3f13c838721d7f550f1744"
        },
        {
          "path": "database/migrations/20260701210729_fcbce524-68f8-48a6-8bc2-1b360d9efe14.sql",
          "sourcePath": "supabase/migrations/20260701210729_fcbce524-68f8-48a6-8bc2-1b360d9efe14.sql",
          "kind": "migration",
          "bytes": 210,
          "sha256": "c45496b7126a4937110d16e7ab388340391f632f65a57f285d47c2c7094470dc"
        },
        {
          "path": "database/migrations/20260701214137_aead1765-5198-4547-8484-28d09b8d7032.sql",
          "sourcePath": "supabase/migrations/20260701214137_aead1765-5198-4547-8484-28d09b8d7032.sql",
          "kind": "migration",
          "bytes": 1348,
          "sha256": "804c3639612ab392039923df1fb71011813b8c3107693ba81b57b5a0f85daf56"
        },
        {
          "path": "database/migrations/20260701215012_6ba6ffd4-687d-4966-8afd-fa0b11393e46.sql",
          "sourcePath": "supabase/migrations/20260701215012_6ba6ffd4-687d-4966-8afd-fa0b11393e46.sql",
          "kind": "migration",
          "bytes": 769,
          "sha256": "5e91ba5a08afb5bb922cc55fccac337644a04058557a9c5d6701e57ab5a1e5b6"
        },
        {
          "path": "database/migrations/20260702040233_9fa40e10-e794-4996-9c5a-5ae919df5f58.sql",
          "sourcePath": "supabase/migrations/20260702040233_9fa40e10-e794-4996-9c5a-5ae919df5f58.sql",
          "kind": "migration",
          "bytes": 308,
          "sha256": "bab89ca537dbbba05702a113cb821b1317dee2e62b15d63adffaa804800d35d8"
        },
        {
          "path": "database/migrations/20260702040522_9726a31b-c54d-4b9b-b41b-c792287e7a4b.sql",
          "sourcePath": "supabase/migrations/20260702040522_9726a31b-c54d-4b9b-b41b-c792287e7a4b.sql",
          "kind": "migration",
          "bytes": 112,
          "sha256": "97ad098a010debe34b4668e671619c263fc7909abd318d49951fc0b7cf545639"
        },
        {
          "path": "database/migrations/20260702042637_542dff2e-393a-46a7-8641-645e31e04e3b.sql",
          "sourcePath": "supabase/migrations/20260702042637_542dff2e-393a-46a7-8641-645e31e04e3b.sql",
          "kind": "migration",
          "bytes": 313,
          "sha256": "74570c310750189a2cf365efc2169e707651dd024e4790c483817ea4042c2b1a"
        },
        {
          "path": "database/migrations/20260702044927_af2e4621-3eeb-4d52-be59-ee5dfa9f8433.sql",
          "sourcePath": "supabase/migrations/20260702044927_af2e4621-3eeb-4d52-be59-ee5dfa9f8433.sql",
          "kind": "migration",
          "bytes": 2418,
          "sha256": "c66808bdfb3672384993519844e51b6ad96e565687034ab045f228bd06313f5c"
        },
        {
          "path": "database/migrations/20260702045449_160b3d53-8ed5-41ae-8622-72724f49f1d5.sql",
          "sourcePath": "supabase/migrations/20260702045449_160b3d53-8ed5-41ae-8622-72724f49f1d5.sql",
          "kind": "migration",
          "bytes": 3194,
          "sha256": "fd11dbe0c1401d0229edf81e13ffe18167c0d1248ebf1a6ce61fd7daafc21fd7"
        },
        {
          "path": "database/migrations/20260702050253_0249cd05-9bd8-4fb3-bfb4-9caabeb03807.sql",
          "sourcePath": "supabase/migrations/20260702050253_0249cd05-9bd8-4fb3-bfb4-9caabeb03807.sql",
          "kind": "migration",
          "bytes": 104,
          "sha256": "be2486bd19932e8154b555eccde7271f6a29134694ebad92b49c6b2a4709f55f"
        },
        {
          "path": "database/migrations/20260702050635_9928d381-059e-49cc-9704-4f9a137bb863.sql",
          "sourcePath": "supabase/migrations/20260702050635_9928d381-059e-49cc-9704-4f9a137bb863.sql",
          "kind": "migration",
          "bytes": 2193,
          "sha256": "ad0e5806ddcefa420c8978c5aa57dbd4e48198f05a964d2b3753735dc14943fb"
        },
        {
          "path": "database/migrations/20260702151720_5e9bd5c8-a46b-4742-934a-947a53544dba.sql",
          "sourcePath": "supabase/migrations/20260702151720_5e9bd5c8-a46b-4742-934a-947a53544dba.sql",
          "kind": "migration",
          "bytes": 74,
          "sha256": "2df46f2587c72a7639b8bcccea54d81ae690bba676c53342f8cb797c1fe2d41c"
        },
        {
          "path": "database/migrations/20260702152539_b8e92111-20f3-4aa2-861d-62bd6c8624c9.sql",
          "sourcePath": "supabase/migrations/20260702152539_b8e92111-20f3-4aa2-861d-62bd6c8624c9.sql",
          "kind": "migration",
          "bytes": 154,
          "sha256": "30acd1e1a35987a6cdf1f44ded733f52d264d0cd6ee465056b3efa6b4ddc74f6"
        },
        {
          "path": "database/migrations/20260702161556_28cbbee8-acc3-4b6f-adda-afccbf660122.sql",
          "sourcePath": "supabase/migrations/20260702161556_28cbbee8-acc3-4b6f-adda-afccbf660122.sql",
          "kind": "migration",
          "bytes": 1003,
          "sha256": "e37f75a2cf5a7b6bda4fa64b1ea4058ea56542d52241d3cbf6060430898ec4f1"
        },
        {
          "path": "database/migrations/20260702204434_3ba0bda5-3c2c-469a-a2bb-21f7ff6bd9b3.sql",
          "sourcePath": "supabase/migrations/20260702204434_3ba0bda5-3c2c-469a-a2bb-21f7ff6bd9b3.sql",
          "kind": "migration",
          "bytes": 315,
          "sha256": "afa3fbae38b518c4f5553ef7bc1711d600923a228e5a592761bbb55ca9eb48a4"
        },
        {
          "path": "database/migrations/20260703045414_457a0784-3a23-4a76-acdd-802280a2fbf5.sql",
          "sourcePath": "supabase/migrations/20260703045414_457a0784-3a23-4a76-acdd-802280a2fbf5.sql",
          "kind": "migration",
          "bytes": 723,
          "sha256": "ec90a0e41880c6cd86e4bd4ac6b9d7f87c90c03ba3f235bbf8a2cd3037aadaca"
        },
        {
          "path": "database/migrations/20260706161829_eb8b618f-3bd9-467c-8f65-9e69559f32c1.sql",
          "sourcePath": "supabase/migrations/20260706161829_eb8b618f-3bd9-467c-8f65-9e69559f32c1.sql",
          "kind": "migration",
          "bytes": 2060,
          "sha256": "95ac3e1296e40a7071b50a49be5a8fd8758ab9a956ce1810d4e54a54273312e7"
        },
        {
          "path": "database/migrations/20260706213857_0a448fd2-0a80-4403-8652-24163babc902.sql",
          "sourcePath": "supabase/migrations/20260706213857_0a448fd2-0a80-4403-8652-24163babc902.sql",
          "kind": "migration",
          "bytes": 2139,
          "sha256": "94c36ad26fab3e188a45ce7624617745d556ea49f8e40e0c540217caf8760a7f"
        },
        {
          "path": "database/migrations/20260708073238_2fe825bc-d1a1-4063-a570-2b1b02463c54.sql",
          "sourcePath": "supabase/migrations/20260708073238_2fe825bc-d1a1-4063-a570-2b1b02463c54.sql",
          "kind": "migration",
          "bytes": 302,
          "sha256": "7dc3e48966918f5bb822bb583900c4d467a794b998bc774a6f117334c6387ef1"
        },
        {
          "path": "database/migrations/20260724064024_8885f743-d651-4f09-a4c7-fbd768e31651.sql",
          "sourcePath": "supabase/migrations/20260724064024_8885f743-d651-4f09-a4c7-fbd768e31651.sql",
          "kind": "migration",
          "bytes": 4697,
          "sha256": "cf7e9ed21aca68933c8826bcbfca7ce948f8ba923fb9518c93fd55d3ef90aba8"
        },
        {
          "path": "database/migrations/20260730150450_0a91a860-1371-4f70-b372-b844650dfd7a.sql",
          "sourcePath": "supabase/migrations/20260730150450_0a91a860-1371-4f70-b372-b844650dfd7a.sql",
          "kind": "migration",
          "bytes": 1324,
          "sha256": "ae5745f9d822476ef86cd160dc79b97e3472d5c5838539b9b22cf549541861fc"
        },
        {
          "path": "database/migrations/20260730151005_b5cc659a-e44e-4253-8fca-e3645ac6305e.sql",
          "sourcePath": "supabase/migrations/20260730151005_b5cc659a-e44e-4253-8fca-e3645ac6305e.sql",
          "kind": "migration",
          "bytes": 785,
          "sha256": "8d5eaed1428dd5142a93dde5ef666a9ead6a1a19ba58be2178c7186118aa932f"
        }
      ],
      "excluded": [
        {
          "path": "src/components/SiteLayout.tsx",
          "reason": "硬编码敏感凭据"
        },
        {
          "path": "src/integrations/supabase/auth-middleware.ts",
          "reason": "平台连接配置、资产指针或受限制路径；目标平台需提供"
        },
        {
          "path": "src/integrations/supabase/client.server.ts",
          "reason": "平台连接配置、资产指针或受限制路径；目标平台需提供"
        },
        {
          "path": "src/integrations/supabase/client.ts",
          "reason": "平台连接配置、资产指针或受限制路径；目标平台需提供"
        },
        {
          "path": "src/integrations/supabase/previewAuthStorage.ts",
          "reason": "平台连接配置、资产指针或受限制路径；目标平台需提供"
        },
        {
          "path": "src/integrations/supabase/public-server.ts",
          "reason": "平台连接配置、资产指针或受限制路径；目标平台需提供"
        },
        {
          "path": "src/integrations/supabase/types.ts",
          "reason": "平台连接配置、资产指针或受限制路径；目标平台需提供"
        },
        {
          "path": "supabase/migrations/20260701195651_d1d7d914-47a0-40ee-8505-7c28c3e8b4ff.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260701202716_c2df0eab-ffd2-4b59-b687-4ee2f8433e55.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260701215650_2d93edf6-6bd2-4504-aace-8f74f08c67f8.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260702034259_23a6e4cd-698a-468c-bac0-47945cfcc239.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260702044522_ba96bfb8-52a3-43ce-9e51-40a410ad49e8.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260702051702_6b3de6b6-253b-42a7-a251-612c146ee6d9.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260702052021_ad015fd7-f374-4b7e-93cb-fb6605b50587.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260702052320_ecc42f51-8864-49e7-960d-2abbac4f0f68.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260702155037_2de0ab0a-a246-4a7f-9886-8adc549c3889.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260702163515_de9164e5-8670-4aa6-ba4b-6882c157d750.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260702171839_ec000826-f903-4cf6-a156-9058e8311965.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260702175343_acd997e7-995f-41a6-b717-37159802e0a4.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260702193734_dbbf5a06-1887-4837-bcec-c040c4ccdaaf.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260702194639_24255401-3ea4-435f-8637-382da617bcc4.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260702195319_14b26a0b-80bb-4062-99ec-fd176c54e684.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260702222447_db9f1590-7e56-4b51-8308-15b1fe909720.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260724040204_83ce723c-5a79-4fe7-acd0-57139228372f.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260724043025_d9a89132-189e-4df5-af6c-1cf1fcdd8798.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260724060831_8909ced7-d162-4511-ad54-88aa195c037c.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        }
      ],
      "errors": [],
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。",
        "需要核对 Lovable Cloud 表结构、SQL 函数、RLS 与历史迁移；不包含任何记录。",
        "包含登录或管理员权限依赖；目标项目需提供兼容的认证及角色机制。",
        "这是实际源代码审查包，不是已验证的独立可安装插件；installable 始终为 false。",
        "源文件按原路径包含；资产保留 src/assets 相对位置以避免破坏引用。",
        "src/components/SiteLayout.tsx：硬编码敏感凭据",
        "src/integrations/supabase/auth-middleware.ts：平台连接配置、资产指针或受限制路径；目标平台需提供",
        "src/integrations/supabase/client.server.ts：平台连接配置、资产指针或受限制路径；目标平台需提供",
        "src/integrations/supabase/client.ts：平台连接配置、资产指针或受限制路径；目标平台需提供",
        "src/integrations/supabase/previewAuthStorage.ts：平台连接配置、资产指针或受限制路径；目标平台需提供",
        "src/integrations/supabase/public-server.ts：平台连接配置、资产指针或受限制路径；目标平台需提供",
        "src/integrations/supabase/types.ts：平台连接配置、资产指针或受限制路径；目标平台需提供",
        "supabase/migrations/20260701195651_d1d7d914-47a0-40ee-8505-7c28c3e8b4ff.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260701202716_c2df0eab-ffd2-4b59-b687-4ee2f8433e55.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260701215650_2d93edf6-6bd2-4504-aace-8f74f08c67f8.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260702034259_23a6e4cd-698a-468c-bac0-47945cfcc239.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260702044522_ba96bfb8-52a3-43ce-9e51-40a410ad49e8.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260702051702_6b3de6b6-253b-42a7-a251-612c146ee6d9.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260702052021_ad015fd7-f374-4b7e-93cb-fb6605b50587.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260702052320_ecc42f51-8864-49e7-960d-2abbac4f0f68.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260702155037_2de0ab0a-a246-4a7f-9886-8adc549c3889.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260702163515_de9164e5-8670-4aa6-ba4b-6882c157d750.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260702171839_ec000826-f903-4cf6-a156-9058e8311965.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260702175343_acd997e7-995f-41a6-b717-37159802e0a4.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260702193734_dbbf5a06-1887-4837-bcec-c040c4ccdaaf.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260702194639_24255401-3ea4-435f-8637-382da617bcc4.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260702195319_14b26a0b-80bb-4062-99ec-fd176c54e684.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260702222447_db9f1590-7e56-4b51-8308-15b1fe909720.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260724040204_83ce723c-5a79-4fe7-acd0-57139228372f.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260724043025_d9a89132-189e-4df5-af6c-1cf1fcdd8798.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260724060831_8909ced7-d162-4511-ad54-88aa195c037c.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "静态敏感信息筛查不是完整安全审计；动态资产、外部服务及目标平台权限需要人工核对。"
      ],
      "cycles": [],
      "configuration": [
        "LOVABLE_API_KEY",
        "SUPABASE_PUBLISHABLE_KEY",
        "SUPABASE_URL"
      ],
      "dependencies": [
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
      "database": [
        "ai_cache",
        "quiz_questions",
        "ai_usage_daily",
        "ai_usage_logs",
        "products",
        "cases",
        "site_settings",
        "pages",
        "tool_categories",
        "tool_items",
        "question_bank_nodes",
        "has_role",
        "list_practice_questions",
        "check_quiz_answer",
        "grade_quiz_questions"
      ],
      "installable": false,
      "canExport": true
    },
    {
      "id": "c1-bank",
      "name": "C1 顺序题库",
      "version": "0.0.0-source-snapshot",
      "digest": "825108853fb39b840d8f04a1654a77aa331adf6ceeae17d0429f376494d0c820",
      "bytes": 30574,
      "files": [
        {
          "path": "src/components/exam/C1QuestionBank.tsx",
          "sourcePath": "src/components/exam/C1QuestionBank.tsx",
          "kind": "private",
          "bytes": 35734,
          "sha256": "ff02e056ba4b2e31dc6d46185a20ab041de36f5182f7d641283e8fd383d373cc"
        },
        {
          "path": "src/components/exam/ExamOptionList.tsx",
          "sourcePath": "src/components/exam/ExamOptionList.tsx",
          "kind": "shared",
          "bytes": 4094,
          "sha256": "c878afbde49a58b63d04deffa432a26dd2ca85f3c03cc713aade33c753f789ca"
        },
        {
          "path": "src/components/ui/button.tsx",
          "sourcePath": "src/components/ui/button.tsx",
          "kind": "shared",
          "bytes": 1894,
          "sha256": "e39813b666ba434660ec088356a0349246b6803a4e99961295d0c82bab1ab862"
        },
        {
          "path": "src/components/ui/card.tsx",
          "sourcePath": "src/components/ui/card.tsx",
          "kind": "shared",
          "bytes": 1817,
          "sha256": "f13878a0078a5ef9f3e92af29259fc1e93ea56ea80cb992e0c4dea4e35396459"
        },
        {
          "path": "src/components/ui/input.tsx",
          "sourcePath": "src/components/ui/input.tsx",
          "kind": "shared",
          "bytes": 776,
          "sha256": "92debb7d6d2d96d9e607a42d5ce8f37b2d63384ae5dd9ffbbf5f047b680ffb85"
        },
        {
          "path": "src/lib/quiz.functions.ts",
          "sourcePath": "src/lib/quiz.functions.ts",
          "kind": "shared",
          "bytes": 14800,
          "sha256": "f1c05840490ee36ad63eb0ee7695b8abb1db9b857e66d6ff126a6bfd8de9909b"
        },
        {
          "path": "src/lib/utils.ts",
          "sourcePath": "src/lib/utils.ts",
          "kind": "shared",
          "bytes": 169,
          "sha256": "d1f1e0d62cb8d8d1e04c26e14de842d8a151f75812d81b046c65b5d1fe8e4b27"
        },
        {
          "path": "src/routes/dmv.c1.question-bank.tsx",
          "sourcePath": "src/routes/dmv.c1.question-bank.tsx",
          "kind": "private",
          "bytes": 986,
          "sha256": "6eedf59fdedf283d6bf94e764110bb8de1300f3552999f45b4d7a11ad99463a4"
        },
        {
          "path": "src/styles.css",
          "sourcePath": "src/styles.css",
          "kind": "shared",
          "bytes": 5655,
          "sha256": "29f12b25c7c28934469eaf4924edc1ff43e31d36cbf7b1314ef36351c850e99f"
        },
        {
          "path": "database/migrations/20260701214137_aead1765-5198-4547-8484-28d09b8d7032.sql",
          "sourcePath": "supabase/migrations/20260701214137_aead1765-5198-4547-8484-28d09b8d7032.sql",
          "kind": "migration",
          "bytes": 1348,
          "sha256": "804c3639612ab392039923df1fb71011813b8c3107693ba81b57b5a0f85daf56"
        },
        {
          "path": "database/migrations/20260701215012_6ba6ffd4-687d-4966-8afd-fa0b11393e46.sql",
          "sourcePath": "supabase/migrations/20260701215012_6ba6ffd4-687d-4966-8afd-fa0b11393e46.sql",
          "kind": "migration",
          "bytes": 769,
          "sha256": "5e91ba5a08afb5bb922cc55fccac337644a04058557a9c5d6701e57ab5a1e5b6"
        },
        {
          "path": "database/migrations/20260702040233_9fa40e10-e794-4996-9c5a-5ae919df5f58.sql",
          "sourcePath": "supabase/migrations/20260702040233_9fa40e10-e794-4996-9c5a-5ae919df5f58.sql",
          "kind": "migration",
          "bytes": 308,
          "sha256": "bab89ca537dbbba05702a113cb821b1317dee2e62b15d63adffaa804800d35d8"
        },
        {
          "path": "database/migrations/20260702040522_9726a31b-c54d-4b9b-b41b-c792287e7a4b.sql",
          "sourcePath": "supabase/migrations/20260702040522_9726a31b-c54d-4b9b-b41b-c792287e7a4b.sql",
          "kind": "migration",
          "bytes": 112,
          "sha256": "97ad098a010debe34b4668e671619c263fc7909abd318d49951fc0b7cf545639"
        },
        {
          "path": "database/migrations/20260702042637_542dff2e-393a-46a7-8641-645e31e04e3b.sql",
          "sourcePath": "supabase/migrations/20260702042637_542dff2e-393a-46a7-8641-645e31e04e3b.sql",
          "kind": "migration",
          "bytes": 313,
          "sha256": "74570c310750189a2cf365efc2169e707651dd024e4790c483817ea4042c2b1a"
        },
        {
          "path": "database/migrations/20260702151720_5e9bd5c8-a46b-4742-934a-947a53544dba.sql",
          "sourcePath": "supabase/migrations/20260702151720_5e9bd5c8-a46b-4742-934a-947a53544dba.sql",
          "kind": "migration",
          "bytes": 74,
          "sha256": "2df46f2587c72a7639b8bcccea54d81ae690bba676c53342f8cb797c1fe2d41c"
        },
        {
          "path": "database/migrations/20260702152539_b8e92111-20f3-4aa2-861d-62bd6c8624c9.sql",
          "sourcePath": "supabase/migrations/20260702152539_b8e92111-20f3-4aa2-861d-62bd6c8624c9.sql",
          "kind": "migration",
          "bytes": 154,
          "sha256": "30acd1e1a35987a6cdf1f44ded733f52d264d0cd6ee465056b3efa6b4ddc74f6"
        },
        {
          "path": "database/migrations/20260730150450_0a91a860-1371-4f70-b372-b844650dfd7a.sql",
          "sourcePath": "supabase/migrations/20260730150450_0a91a860-1371-4f70-b372-b844650dfd7a.sql",
          "kind": "migration",
          "bytes": 1324,
          "sha256": "ae5745f9d822476ef86cd160dc79b97e3472d5c5838539b9b22cf549541861fc"
        },
        {
          "path": "database/migrations/20260730151005_b5cc659a-e44e-4253-8fca-e3645ac6305e.sql",
          "sourcePath": "supabase/migrations/20260730151005_b5cc659a-e44e-4253-8fca-e3645ac6305e.sql",
          "kind": "migration",
          "bytes": 785,
          "sha256": "8d5eaed1428dd5142a93dde5ef666a9ead6a1a19ba58be2178c7186118aa932f"
        }
      ],
      "excluded": [
        {
          "path": "src/integrations/supabase/public-server.ts",
          "reason": "平台连接配置、资产指针或受限制路径；目标平台需提供"
        },
        {
          "path": "src/integrations/supabase/types.ts",
          "reason": "平台连接配置、资产指针或受限制路径；目标平台需提供"
        },
        {
          "path": "supabase/migrations/20260702155037_2de0ab0a-a246-4a7f-9886-8adc549c3889.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260702163515_de9164e5-8670-4aa6-ba4b-6882c157d750.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260702171839_ec000826-f903-4cf6-a156-9058e8311965.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        }
      ],
      "errors": [],
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。",
        "需要核对 Lovable Cloud 表结构、SQL 函数、RLS 与历史迁移；不包含任何记录。",
        "这是实际源代码审查包，不是已验证的独立可安装插件；installable 始终为 false。",
        "源文件按原路径包含；资产保留 src/assets 相对位置以避免破坏引用。",
        "src/integrations/supabase/public-server.ts：平台连接配置、资产指针或受限制路径；目标平台需提供",
        "src/integrations/supabase/types.ts：平台连接配置、资产指针或受限制路径；目标平台需提供",
        "supabase/migrations/20260702155037_2de0ab0a-a246-4a7f-9886-8adc549c3889.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260702163515_de9164e5-8670-4aa6-ba4b-6882c157d750.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260702171839_ec000826-f903-4cf6-a156-9058e8311965.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "静态敏感信息筛查不是完整安全审计；动态资产、外部服务及目标平台权限需要人工核对。"
      ],
      "cycles": [],
      "configuration": [],
      "dependencies": [
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
      "database": [
        "question_bank_nodes",
        "quiz_questions",
        "list_practice_questions",
        "check_quiz_answer",
        "grade_quiz_questions"
      ],
      "installable": false,
      "canExport": true
    },
    {
      "id": "automotive",
      "name": "汽车工具中心",
      "version": "0.0.0-source-snapshot",
      "digest": "ec51dafe3d0055b3feb5b25d8d8e921456d57867d87acd3225f20b28e7ea5c73",
      "bytes": 54103,
      "files": [
        {
          "path": "src/components/automotive/AutomotiveHub.tsx",
          "sourcePath": "src/components/automotive/AutomotiveHub.tsx",
          "kind": "private",
          "bytes": 3008,
          "sha256": "54f08ff81685d1b6bbfd06d51b8c69e9ee04326d226657382fa7dd9ff01b862b"
        },
        {
          "path": "src/components/calculator/Calculator.tsx",
          "sourcePath": "src/components/calculator/Calculator.tsx",
          "kind": "shared",
          "bytes": 9398,
          "sha256": "1a719d0a0beb4199dc8092c45ea73e1ed517f50d28b9900096d38c3c13d05206"
        },
        {
          "path": "src/components/converter/UnitConverter.tsx",
          "sourcePath": "src/components/converter/UnitConverter.tsx",
          "kind": "shared",
          "bytes": 8556,
          "sha256": "299c9e703f7b1112606a81aec0cdeb7afaae82c1372fd4e35d6768a11e0d9c93"
        },
        {
          "path": "src/components/ui/button.tsx",
          "sourcePath": "src/components/ui/button.tsx",
          "kind": "shared",
          "bytes": 1894,
          "sha256": "e39813b666ba434660ec088356a0349246b6803a4e99961295d0c82bab1ab862"
        },
        {
          "path": "src/components/ui/input.tsx",
          "sourcePath": "src/components/ui/input.tsx",
          "kind": "shared",
          "bytes": 776,
          "sha256": "92debb7d6d2d96d9e607a42d5ce8f37b2d63384ae5dd9ffbbf5f047b680ffb85"
        },
        {
          "path": "src/lib/calculators/automotive.ts",
          "sourcePath": "src/lib/calculators/automotive.ts",
          "kind": "shared",
          "bytes": 2541,
          "sha256": "358ba31e97bf15e6070b1a8edc7591c2b5a5f8d20afe3708621083c8e211d117"
        },
        {
          "path": "src/lib/calculators/decoration.ts",
          "sourcePath": "src/lib/calculators/decoration.ts",
          "kind": "shared",
          "bytes": 7566,
          "sha256": "06fe9165953f422f29ce3e064d6006cc13a19c643d32325b8094ff5cbb14185e"
        },
        {
          "path": "src/lib/calculators/finance.ts",
          "sourcePath": "src/lib/calculators/finance.ts",
          "kind": "shared",
          "bytes": 14072,
          "sha256": "1b7e5d3b99bb16fc9e0b0bc3302fde39f873f5e8dc7bea4a7108cda6c084140d"
        },
        {
          "path": "src/lib/calculators/health.ts",
          "sourcePath": "src/lib/calculators/health.ts",
          "kind": "shared",
          "bytes": 8472,
          "sha256": "8575f3427956fd2d85544711b4ca08eda2b7b7128e28057e05b256a9a8fb78ba"
        },
        {
          "path": "src/lib/calculators/index.ts",
          "sourcePath": "src/lib/calculators/index.ts",
          "kind": "shared",
          "bytes": 819,
          "sha256": "030ab3475b9ce006a4f5f04ff60e670e62f08f41791bdf749fb901cb92c3ca79"
        },
        {
          "path": "src/lib/calculators/logistics.ts",
          "sourcePath": "src/lib/calculators/logistics.ts",
          "kind": "shared",
          "bytes": 5347,
          "sha256": "4174507cbbcb52dcf861c8c280fe4a2fc4232715619072350dec0c7bf4281b4c"
        },
        {
          "path": "src/lib/calculators/nas.ts",
          "sourcePath": "src/lib/calculators/nas.ts",
          "kind": "shared",
          "bytes": 5835,
          "sha256": "935aeb14e1b5b2dd7486c0c0278d13e2dc4828231ff0b62ddc75fd630cf96feb"
        },
        {
          "path": "src/lib/calculators/types.ts",
          "sourcePath": "src/lib/calculators/types.ts",
          "kind": "shared",
          "bytes": 1180,
          "sha256": "bb7ddab8c875ef5e06e345f4f1ca197467ba463771429ef97dba4d4a9e9e9038"
        },
        {
          "path": "src/lib/calculators/usa.ts",
          "sourcePath": "src/lib/calculators/usa.ts",
          "kind": "shared",
          "bytes": 3567,
          "sha256": "07693c4aff5b17caf2867db3e7555302e7f08c55cb796ed10670ac9a32ca2424"
        },
        {
          "path": "src/lib/converters/area.ts",
          "sourcePath": "src/lib/converters/area.ts",
          "kind": "shared",
          "bytes": 2276,
          "sha256": "1ac5e8fd11b032adcebd46f058ee4761ac1ff81250ce7198cdf0de7b01f212ba"
        },
        {
          "path": "src/lib/converters/fuel.ts",
          "sourcePath": "src/lib/converters/fuel.ts",
          "kind": "shared",
          "bytes": 1921,
          "sha256": "24afb3ed2639b3bc527b7629d13ee8bc01aef323a65719c6d5d1f8a465a28215"
        },
        {
          "path": "src/lib/converters/index.ts",
          "sourcePath": "src/lib/converters/index.ts",
          "kind": "shared",
          "bytes": 1266,
          "sha256": "1707146b17f5c3edfa33f6f1325c6a74132f3a3690b8a9c43bce1be995526a7f"
        },
        {
          "path": "src/lib/converters/length.ts",
          "sourcePath": "src/lib/converters/length.ts",
          "kind": "shared",
          "bytes": 3098,
          "sha256": "df3a1f2bb5fd1498ec69fc49ad2849bd13e8469ec08277fbcffd59af46e35676"
        },
        {
          "path": "src/lib/converters/number.ts",
          "sourcePath": "src/lib/converters/number.ts",
          "kind": "shared",
          "bytes": 2098,
          "sha256": "3cbbb015655359d0782e1986458e138307a44407db0bc66df4e72bc82fc3a7c7"
        },
        {
          "path": "src/lib/converters/power.ts",
          "sourcePath": "src/lib/converters/power.ts",
          "kind": "shared",
          "bytes": 1977,
          "sha256": "8fa0fa68161c32de70d5032245dec676c400d55490a77ef53fce5e7869258e5c"
        },
        {
          "path": "src/lib/converters/pressure.ts",
          "sourcePath": "src/lib/converters/pressure.ts",
          "kind": "shared",
          "bytes": 1860,
          "sha256": "6052463630dfe27c90f2dbc098c7f992b95de1b122e5e7e2088192db4ff7b95f"
        },
        {
          "path": "src/lib/converters/speed.ts",
          "sourcePath": "src/lib/converters/speed.ts",
          "kind": "shared",
          "bytes": 1638,
          "sha256": "a3e0db881b658fdcd9ee2321f147136e38d5b2441e1b3e105f1409b7e2df641a"
        },
        {
          "path": "src/lib/converters/storage.ts",
          "sourcePath": "src/lib/converters/storage.ts",
          "kind": "shared",
          "bytes": 1888,
          "sha256": "e64de03fbc0b871ca75575ed5f4422e0887b69e5e0a4bd6500589d9507d62f2e"
        },
        {
          "path": "src/lib/converters/temperature.ts",
          "sourcePath": "src/lib/converters/temperature.ts",
          "kind": "shared",
          "bytes": 2269,
          "sha256": "8c5efd736d61f4b5f18ceeb403eb463d70cd1701896b76ea4a10cb1f575210c6"
        },
        {
          "path": "src/lib/converters/types.ts",
          "sourcePath": "src/lib/converters/types.ts",
          "kind": "shared",
          "bytes": 1358,
          "sha256": "b657932d617a0250e229908f7404911c1fda904e4e2233424ddb9058a3f5af10"
        },
        {
          "path": "src/lib/converters/units.ts",
          "sourcePath": "src/lib/converters/units.ts",
          "kind": "shared",
          "bytes": 8643,
          "sha256": "7322c70904e2b3fd3e9d1287f666f8699fbfb8dd88dde6b27ab134284d7e0391"
        },
        {
          "path": "src/lib/converters/volume.ts",
          "sourcePath": "src/lib/converters/volume.ts",
          "kind": "shared",
          "bytes": 2520,
          "sha256": "670a93f4754ff03b299b7ad28994f06075cf0d0406b2938475bd9fa97cdc6005"
        },
        {
          "path": "src/lib/converters/weight.ts",
          "sourcePath": "src/lib/converters/weight.ts",
          "kind": "shared",
          "bytes": 2119,
          "sha256": "558caa719a933d34ecd9d2d317feea4d26d09d2a96ca0b328e21a44e62789637"
        },
        {
          "path": "src/lib/utils.ts",
          "sourcePath": "src/lib/utils.ts",
          "kind": "shared",
          "bytes": 169,
          "sha256": "d1f1e0d62cb8d8d1e04c26e14de842d8a151f75812d81b046c65b5d1fe8e4b27"
        },
        {
          "path": "src/styles.css",
          "sourcePath": "src/styles.css",
          "kind": "shared",
          "bytes": 5655,
          "sha256": "29f12b25c7c28934469eaf4924edc1ff43e31d36cbf7b1314ef36351c850e99f"
        }
      ],
      "excluded": [],
      "errors": [],
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。",
        "这是实际源代码审查包，不是已验证的独立可安装插件；installable 始终为 false。",
        "源文件按原路径包含；资产保留 src/assets 相对位置以避免破坏引用。",
        "模块耦合：calculator, converter",
        "静态敏感信息筛查不是完整安全审计；动态资产、外部服务及目标平台权限需要人工核对。"
      ],
      "cycles": [],
      "configuration": [],
      "dependencies": [
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
      "database": [],
      "installable": false,
      "canExport": true
    },
    {
      "id": "photo-wall",
      "name": "Photo Wall Studio",
      "version": "0.0.0-source-snapshot",
      "digest": "1bc360ca34133be6bf4b6e37eaf55d4339c962e299155cfc56e3c89f00aee4e3",
      "bytes": 1153259,
      "files": [
        {
          "path": "src/assets/service-business-platforms.jpg",
          "sourcePath": "src/assets/service-business-platforms.jpg",
          "kind": "asset",
          "bytes": 140119,
          "sha256": "4733e025a724357656c376b61adfa2f7ff4d7575708936c99170fe73ec32e96a"
        },
        {
          "path": "src/assets/service-cloud-deployment.jpg",
          "sourcePath": "src/assets/service-cloud-deployment.jpg",
          "kind": "asset",
          "bytes": 137121,
          "sha256": "09e7a5f28857547a68f15211f1484d98b5a813a4b46e67b2a43da99585462f04"
        },
        {
          "path": "src/assets/service-custom-software.jpg",
          "sourcePath": "src/assets/service-custom-software.jpg",
          "kind": "asset",
          "bytes": 131429,
          "sha256": "94d6fc2e364c17e9162ff5977d79ac08c06d691820388fc9e5ab7871f008b576"
        },
        {
          "path": "src/assets/service-home-media.jpg",
          "sourcePath": "src/assets/service-home-media.jpg",
          "kind": "asset",
          "bytes": 153051,
          "sha256": "5ab29a1cd169fbdc917f713d59cd543cd81f976982ddaf8a718d3fe5380871c9"
        },
        {
          "path": "src/assets/service-home-network.jpg",
          "sourcePath": "src/assets/service-home-network.jpg",
          "kind": "asset",
          "bytes": 136120,
          "sha256": "bba6cf864bd2a22c5533320e29a9ce2104c34799833c885885d29b4d4e43e4dc"
        },
        {
          "path": "src/assets/service-nas.jpg",
          "sourcePath": "src/assets/service-nas.jpg",
          "kind": "asset",
          "bytes": 147867,
          "sha256": "d0761bb6777ca8537bc80096818aae86833ab29ae06bb071c07062122f3e8a7f"
        },
        {
          "path": "src/assets/service-smart-home.jpg",
          "sourcePath": "src/assets/service-smart-home.jpg",
          "kind": "asset",
          "bytes": 123936,
          "sha256": "e6b54101a27c481fe46dbacf71738c07e9174e36acbae64ff4ee66b545338ba8"
        },
        {
          "path": "src/assets/service-websites.jpg",
          "sourcePath": "src/assets/service-websites.jpg",
          "kind": "asset",
          "bytes": 165323,
          "sha256": "c925841def888e21a5007873612a45cdadc8806c7176638f9e40ac0b60882029"
        },
        {
          "path": "src/components/admin/ConfirmDialog.tsx",
          "sourcePath": "src/components/admin/ConfirmDialog.tsx",
          "kind": "private",
          "bytes": 1346,
          "sha256": "e863132fdca3174c8c43ac868084a9059a26a70866c3336a9fcf3583951a598f"
        },
        {
          "path": "src/components/photowall/AnimationLibrary.tsx",
          "sourcePath": "src/components/photowall/AnimationLibrary.tsx",
          "kind": "private",
          "bytes": 31783,
          "sha256": "4486d7d3bc38f73aae90c28222d187a67db0b7ccd38e79bfdf3f71403c93e4ec"
        },
        {
          "path": "src/components/photowall/Inspector.tsx",
          "sourcePath": "src/components/photowall/Inspector.tsx",
          "kind": "private",
          "bytes": 23505,
          "sha256": "498dbb4e8d5cd055241a067667d18289a028e62758956279b13b42a39d59228a"
        },
        {
          "path": "src/components/photowall/LeftPanels.tsx",
          "sourcePath": "src/components/photowall/LeftPanels.tsx",
          "kind": "private",
          "bytes": 63748,
          "sha256": "5aa59608bdbdaf5980d97afc3dbe4dd91759773eababadeac6a00fde73e18cce"
        },
        {
          "path": "src/components/photowall/PlaybackBar.tsx",
          "sourcePath": "src/components/photowall/PlaybackBar.tsx",
          "kind": "private",
          "bytes": 2384,
          "sha256": "134171ee81222eebd80ee91c8cbb00d64abc3f5781ab4e89c57702f9a6a306c0"
        },
        {
          "path": "src/components/photowall/PreviewCanvas.tsx",
          "sourcePath": "src/components/photowall/PreviewCanvas.tsx",
          "kind": "private",
          "bytes": 9583,
          "sha256": "78959c1e9fad4a108c41f2889b6f4c71a33664bf0e991c3e835dc17e0ed3efbb"
        },
        {
          "path": "src/components/photowall/StudioEditor.tsx",
          "sourcePath": "src/components/photowall/StudioEditor.tsx",
          "kind": "private",
          "bytes": 15416,
          "sha256": "69c27c52d9bcdcf5df69dd2081b6ccbe512a232425450c15ada5b53817439ae4"
        },
        {
          "path": "src/components/photowall/Timeline.tsx",
          "sourcePath": "src/components/photowall/Timeline.tsx",
          "kind": "private",
          "bytes": 21939,
          "sha256": "eeff94db4c1f9d99fef7c77089fe13fbf0c1628fb8510841c8de2436e10637ae"
        },
        {
          "path": "src/components/photowall/ctx.ts",
          "sourcePath": "src/components/photowall/ctx.ts",
          "kind": "private",
          "bytes": 2411,
          "sha256": "edd374f555affaa6dc2c1538889bc0d58ad677e0aef41b4cc9538c5b86243f7f"
        },
        {
          "path": "src/components/photowall/rail.ts",
          "sourcePath": "src/components/photowall/rail.ts",
          "kind": "private",
          "bytes": 892,
          "sha256": "afa5aef81c13522aa1dd5650da3bf2212d8af05926e2f46905a55a5a884ca091"
        },
        {
          "path": "src/components/ui/alert-dialog.tsx",
          "sourcePath": "src/components/ui/alert-dialog.tsx",
          "kind": "shared",
          "bytes": 4183,
          "sha256": "ee4d7f3341a1e5592787b7dac8e924bd226189492819f6704d8a7faf8fe64d20"
        },
        {
          "path": "src/components/ui/button.tsx",
          "sourcePath": "src/components/ui/button.tsx",
          "kind": "shared",
          "bytes": 1894,
          "sha256": "e39813b666ba434660ec088356a0349246b6803a4e99961295d0c82bab1ab862"
        },
        {
          "path": "src/components/ui/context-menu.tsx",
          "sourcePath": "src/components/ui/context-menu.tsx",
          "kind": "shared",
          "bytes": 7391,
          "sha256": "9ba8c0fc29c25f440a1d8806e16d42c1083e9909e7ed1f1b9b0deb2ae00e1d13"
        },
        {
          "path": "src/components/ui/dialog.tsx",
          "sourcePath": "src/components/ui/dialog.tsx",
          "kind": "shared",
          "bytes": 3648,
          "sha256": "e3a6de153fb15597ea95be9c4549211a297c060267787915599e3d680d476bd9"
        },
        {
          "path": "src/components/ui/dropdown-menu.tsx",
          "sourcePath": "src/components/ui/dropdown-menu.tsx",
          "kind": "shared",
          "bytes": 7596,
          "sha256": "c6eb5ff28e5bc3cdbe38a11d680aae56d885285e4aca7c8288609811effc04cb"
        },
        {
          "path": "src/components/ui/input.tsx",
          "sourcePath": "src/components/ui/input.tsx",
          "kind": "shared",
          "bytes": 776,
          "sha256": "92debb7d6d2d96d9e607a42d5ce8f37b2d63384ae5dd9ffbbf5f047b680ffb85"
        },
        {
          "path": "src/components/ui/label.tsx",
          "sourcePath": "src/components/ui/label.tsx",
          "kind": "shared",
          "bytes": 716,
          "sha256": "9f72e2ecf16206593aa9e3c4fbc14cd8e81aa8488d57d92d4a950b30935a9fa9"
        },
        {
          "path": "src/components/ui/navigation-menu.tsx",
          "sourcePath": "src/components/ui/navigation-menu.tsx",
          "kind": "shared",
          "bytes": 5152,
          "sha256": "755aecc77b7911ab61159c9fbb9b25254009eb4c32c95b1430b6b5b7d37ed8f0"
        },
        {
          "path": "src/components/ui/progress.tsx",
          "sourcePath": "src/components/ui/progress.tsx",
          "kind": "shared",
          "bytes": 781,
          "sha256": "418f612946a520d1380b7a0d058185bb6a6d09846846dd6d6904a0016152dd4a"
        },
        {
          "path": "src/components/ui/select.tsx",
          "sourcePath": "src/components/ui/select.tsx",
          "kind": "shared",
          "bytes": 5749,
          "sha256": "6d4deee18cf7ced0354eb719300833a83caf46400de6ee9c3d1942fa4c579ad4"
        },
        {
          "path": "src/components/ui/sheet.tsx",
          "sourcePath": "src/components/ui/sheet.tsx",
          "kind": "shared",
          "bytes": 4248,
          "sha256": "a82f9341962e766ee925a2fe883b0a9ab5d5dd8475c402ac8e491ee37dc95fde"
        },
        {
          "path": "src/components/ui/slider.tsx",
          "sourcePath": "src/components/ui/slider.tsx",
          "kind": "shared",
          "bytes": 1025,
          "sha256": "d307cf3ff05b54be4a04389ef4379f9e8b4dc49720197937991ce843a8d4b5ec"
        },
        {
          "path": "src/components/ui/sonner.tsx",
          "sourcePath": "src/components/ui/sonner.tsx",
          "kind": "shared",
          "bytes": 734,
          "sha256": "3ad40f66c339e799b1a57c00e10b4627294c7d580d99d8a48ae0d8d4c13cf931"
        },
        {
          "path": "src/components/ui/switch.tsx",
          "sourcePath": "src/components/ui/switch.tsx",
          "kind": "shared",
          "bytes": 1156,
          "sha256": "c3c298df4ffb56695e4a8f0ff3e37eee08437dec542a677153ec16bed0820107"
        },
        {
          "path": "src/components/ui/textarea.tsx",
          "sourcePath": "src/components/ui/textarea.tsx",
          "kind": "shared",
          "bytes": 677,
          "sha256": "35617a2cf053e52c9e56983bde82d556861d38e462f9e578876c8e99a0432687"
        },
        {
          "path": "src/components/ui/tooltip.tsx",
          "sourcePath": "src/components/ui/tooltip.tsx",
          "kind": "shared",
          "bytes": 1278,
          "sha256": "9682690fc3755d0f4b8684f2d7b1f77945876d41a45b723d0761b26804ad5010"
        },
        {
          "path": "src/lib/cms.functions.ts",
          "sourcePath": "src/lib/cms.functions.ts",
          "kind": "shared",
          "bytes": 9457,
          "sha256": "0a9390bc00c78f23850bc6909946f54d3f4b461df56f70f090e866ed4db1db1d"
        },
        {
          "path": "src/lib/i18n.tsx",
          "sourcePath": "src/lib/i18n.tsx",
          "kind": "shared",
          "bytes": 12454,
          "sha256": "15d6ec8a275563b5578c5a65d060b22b25879bb4f269baba6597c924453a2697"
        },
        {
          "path": "src/lib/photowall/animations.ts",
          "sourcePath": "src/lib/photowall/animations.ts",
          "kind": "private",
          "bytes": 63498,
          "sha256": "0b89acd1249394655f9cddf6fd49c41d9b207b96e68d6cc7d8f5ffaaf241d47d"
        },
        {
          "path": "src/lib/photowall/audio.ts",
          "sourcePath": "src/lib/photowall/audio.ts",
          "kind": "private",
          "bytes": 1991,
          "sha256": "78e3850561a7947e63ab75fc21690564d1be3614f7af04f4318a8d8a5f7fadb0"
        },
        {
          "path": "src/lib/photowall/export.ts",
          "sourcePath": "src/lib/photowall/export.ts",
          "kind": "private",
          "bytes": 5328,
          "sha256": "af8dadcc8e0c3bc7f4c657036b4fd0e070da2d2da9aa8542d18fa807ac08bf6a"
        },
        {
          "path": "src/lib/photowall/fx.ts",
          "sourcePath": "src/lib/photowall/fx.ts",
          "kind": "private",
          "bytes": 21227,
          "sha256": "9e468fb5b2d8e7ce3bfef9ee3c416bd9340d225671d934857df55d8644f53329"
        },
        {
          "path": "src/lib/photowall/poster.functions.ts",
          "sourcePath": "src/lib/photowall/poster.functions.ts",
          "kind": "private",
          "bytes": 815,
          "sha256": "16fb17efb15ed031460e995b947c4ac92507f6eddd807bcde7da530c49e14663"
        },
        {
          "path": "src/lib/photowall/poster.server.ts",
          "sourcePath": "src/lib/photowall/poster.server.ts",
          "kind": "private",
          "bytes": 2856,
          "sha256": "e1327c1094193bfaf78b3b9cc058da142b2f83733d42fb053e60a1cb698b3087"
        },
        {
          "path": "src/lib/photowall/presets.ts",
          "sourcePath": "src/lib/photowall/presets.ts",
          "kind": "private",
          "bytes": 5224,
          "sha256": "4f5861e1d0a0377a72e0f419f8ed06a937dce9f4c2c904e991cddc48f8e97ec6"
        },
        {
          "path": "src/lib/photowall/render.ts",
          "sourcePath": "src/lib/photowall/render.ts",
          "kind": "private",
          "bytes": 36636,
          "sha256": "a4d693633ea289f6a41366eb25b5b77f0c7e7ac6ba08e206c41ed8701e887a31"
        },
        {
          "path": "src/lib/photowall/scenes.ts",
          "sourcePath": "src/lib/photowall/scenes.ts",
          "kind": "private",
          "bytes": 26715,
          "sha256": "715e89a226271c0afd1f6a5eca56dc98e140528ab06057a9786197e8a4f8541b"
        },
        {
          "path": "src/lib/photowall/store.ts",
          "sourcePath": "src/lib/photowall/store.ts",
          "kind": "private",
          "bytes": 3057,
          "sha256": "7c5185d5da99727e077f1c9c9783a65c0067699ff90942f867a56eedd3b5c1a1"
        },
        {
          "path": "src/lib/photowall/text.ts",
          "sourcePath": "src/lib/photowall/text.ts",
          "kind": "private",
          "bytes": 23546,
          "sha256": "e48a1ca169902579ee820b0799fe0f2f824ca8f9f429a2e2cd3ce3f63e36c6bf"
        },
        {
          "path": "src/lib/photowall/types.ts",
          "sourcePath": "src/lib/photowall/types.ts",
          "kind": "private",
          "bytes": 9842,
          "sha256": "8db118a554bca8f20cf326628415fc69adb964abc739164a3523c558015f9ae7"
        },
        {
          "path": "src/lib/platform-bootstrap.tsx",
          "sourcePath": "src/lib/platform-bootstrap.tsx",
          "kind": "shared",
          "bytes": 2943,
          "sha256": "d73032adeff5e437abfe228493afaccee42ba374f9e7d63a2e09687be8283a43"
        },
        {
          "path": "src/lib/services-data.ts",
          "sourcePath": "src/lib/services-data.ts",
          "kind": "shared",
          "bytes": 16228,
          "sha256": "626b414329846937b859c9244df323b968aabf431f0c1cf84cf3683e5bccb676"
        },
        {
          "path": "src/lib/utils.ts",
          "sourcePath": "src/lib/utils.ts",
          "kind": "shared",
          "bytes": 169,
          "sha256": "d1f1e0d62cb8d8d1e04c26e14de842d8a151f75812d81b046c65b5d1fe8e4b27"
        },
        {
          "path": "src/routes/display.photo-wall-preview.$id.tsx",
          "sourcePath": "src/routes/display.photo-wall-preview.$id.tsx",
          "kind": "private",
          "bytes": 10216,
          "sha256": "90da3e970c1513c72fb9734db4487d89e45b7968e5aeb933244b7da2e2098943"
        },
        {
          "path": "src/routes/tools.photo-wall.$id.tsx",
          "sourcePath": "src/routes/tools.photo-wall.$id.tsx",
          "kind": "private",
          "bytes": 2175,
          "sha256": "f7efdb13a0f1ffe0d40b2664240a7ab7f97017d123859bf33c2d8d27b755b46f"
        },
        {
          "path": "src/routes/tools.photo-wall.index.tsx",
          "sourcePath": "src/routes/tools.photo-wall.index.tsx",
          "kind": "private",
          "bytes": 7698,
          "sha256": "52ebb1ca97dff109b416e718e75a703bbec65cff4a87aadeca3b712d4950575c"
        },
        {
          "path": "src/styles.css",
          "sourcePath": "src/styles.css",
          "kind": "shared",
          "bytes": 5655,
          "sha256": "29f12b25c7c28934469eaf4924edc1ff43e31d36cbf7b1314ef36351c850e99f"
        },
        {
          "path": "database/migrations/20260605025102_b5a1855f-984a-411a-a705-bf46012dc5b6.sql",
          "sourcePath": "supabase/migrations/20260605025102_b5a1855f-984a-411a-a705-bf46012dc5b6.sql",
          "kind": "migration",
          "bytes": 4351,
          "sha256": "12798c573bd36ceabed75e19294cf4e6f0550babe09b4aba18a1d598ca7fba08"
        },
        {
          "path": "database/migrations/20260605042145_9830a646-87e5-4bb2-9cba-3b95566dffee.sql",
          "sourcePath": "supabase/migrations/20260605042145_9830a646-87e5-4bb2-9cba-3b95566dffee.sql",
          "kind": "migration",
          "bytes": 576,
          "sha256": "ab5cfaaa796d5926325ae92b53c16c2013ec508792c3e6de9a5ec51721435fef"
        },
        {
          "path": "database/migrations/20260701150020_80a3f5d8-f7c2-4c48-a7a7-2167b418c679.sql",
          "sourcePath": "supabase/migrations/20260701150020_80a3f5d8-f7c2-4c48-a7a7-2167b418c679.sql",
          "kind": "migration",
          "bytes": 1230,
          "sha256": "7b4cc4a4686b122a11bbaf7093c33971a0ae7c8461b937d421544df46b93a14d"
        },
        {
          "path": "database/migrations/20260701155726_58964244-bc02-4244-8029-cb2bbb228957.sql",
          "sourcePath": "supabase/migrations/20260701155726_58964244-bc02-4244-8029-cb2bbb228957.sql",
          "kind": "migration",
          "bytes": 2995,
          "sha256": "10d64474d4de50d5940192d7398a8e1982a5b94c69248415452e9fb303fb8a19"
        },
        {
          "path": "database/migrations/20260701161506_bf4d7def-5e05-41ba-84d7-4e99337f4f76.sql",
          "sourcePath": "supabase/migrations/20260701161506_bf4d7def-5e05-41ba-84d7-4e99337f4f76.sql",
          "kind": "migration",
          "bytes": 117,
          "sha256": "47770537c164a2f9a959362fc63abfa2c2d00c46d01aca532f868848faf15383"
        },
        {
          "path": "database/migrations/20260701200509_6225bdc7-d2b4-4fb7-b94d-3eed26d19051.sql",
          "sourcePath": "supabase/migrations/20260701200509_6225bdc7-d2b4-4fb7-b94d-3eed26d19051.sql",
          "kind": "migration",
          "bytes": 65,
          "sha256": "8c3732a1a7dea2a787bd77f8ccfad29dfa5ab6170c3f13c838721d7f550f1744"
        },
        {
          "path": "database/migrations/20260701210729_fcbce524-68f8-48a6-8bc2-1b360d9efe14.sql",
          "sourcePath": "supabase/migrations/20260701210729_fcbce524-68f8-48a6-8bc2-1b360d9efe14.sql",
          "kind": "migration",
          "bytes": 210,
          "sha256": "c45496b7126a4937110d16e7ab388340391f632f65a57f285d47c2c7094470dc"
        },
        {
          "path": "database/migrations/20260702044927_af2e4621-3eeb-4d52-be59-ee5dfa9f8433.sql",
          "sourcePath": "supabase/migrations/20260702044927_af2e4621-3eeb-4d52-be59-ee5dfa9f8433.sql",
          "kind": "migration",
          "bytes": 2418,
          "sha256": "c66808bdfb3672384993519844e51b6ad96e565687034ab045f228bd06313f5c"
        },
        {
          "path": "database/migrations/20260702050253_0249cd05-9bd8-4fb3-bfb4-9caabeb03807.sql",
          "sourcePath": "supabase/migrations/20260702050253_0249cd05-9bd8-4fb3-bfb4-9caabeb03807.sql",
          "kind": "migration",
          "bytes": 104,
          "sha256": "be2486bd19932e8154b555eccde7271f6a29134694ebad92b49c6b2a4709f55f"
        },
        {
          "path": "database/migrations/20260702204434_3ba0bda5-3c2c-469a-a2bb-21f7ff6bd9b3.sql",
          "sourcePath": "supabase/migrations/20260702204434_3ba0bda5-3c2c-469a-a2bb-21f7ff6bd9b3.sql",
          "kind": "migration",
          "bytes": 315,
          "sha256": "afa3fbae38b518c4f5553ef7bc1711d600923a228e5a592761bbb55ca9eb48a4"
        },
        {
          "path": "database/migrations/20260706213857_0a448fd2-0a80-4403-8652-24163babc902.sql",
          "sourcePath": "supabase/migrations/20260706213857_0a448fd2-0a80-4403-8652-24163babc902.sql",
          "kind": "migration",
          "bytes": 2139,
          "sha256": "94c36ad26fab3e188a45ce7624617745d556ea49f8e40e0c540217caf8760a7f"
        }
      ],
      "excluded": [
        {
          "path": "src/components/SiteLayout.tsx",
          "reason": "硬编码敏感凭据"
        },
        {
          "path": "src/integrations/supabase/public-server.ts",
          "reason": "平台连接配置、资产指针或受限制路径；目标平台需提供"
        },
        {
          "path": "src/integrations/supabase/types.ts",
          "reason": "平台连接配置、资产指针或受限制路径；目标平台需提供"
        },
        {
          "path": "supabase/migrations/20260701195651_d1d7d914-47a0-40ee-8505-7c28c3e8b4ff.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260701202716_c2df0eab-ffd2-4b59-b687-4ee2f8433e55.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260701215650_2d93edf6-6bd2-4504-aace-8f74f08c67f8.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260702034259_23a6e4cd-698a-468c-bac0-47945cfcc239.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260702052021_ad015fd7-f374-4b7e-93cb-fb6605b50587.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260702171839_ec000826-f903-4cf6-a156-9058e8311965.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260702175343_acd997e7-995f-41a6-b717-37159802e0a4.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260702193734_dbbf5a06-1887-4837-bcec-c040c4ccdaaf.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260702194639_24255401-3ea4-435f-8637-382da617bcc4.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260702195319_14b26a0b-80bb-4062-99ec-fd176c54e684.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260702222447_db9f1590-7e56-4b51-8308-15b1fe909720.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260724060831_8909ced7-d162-4511-ad54-88aa195c037c.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        }
      ],
      "errors": [],
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。",
        "依赖浏览器 IndexedDB、图片/音乐资源与浏览器视频编码能力；清单不包含用户项目或媒体。",
        "需要核对 Lovable Cloud 表结构、SQL 函数、RLS 与历史迁移；不包含任何记录。",
        "这是实际源代码审查包，不是已验证的独立可安装插件；installable 始终为 false。",
        "源文件按原路径包含；资产保留 src/assets 相对位置以避免破坏引用。",
        "src/components/SiteLayout.tsx：硬编码敏感凭据",
        "src/integrations/supabase/public-server.ts：平台连接配置、资产指针或受限制路径；目标平台需提供",
        "src/integrations/supabase/types.ts：平台连接配置、资产指针或受限制路径；目标平台需提供",
        "supabase/migrations/20260701195651_d1d7d914-47a0-40ee-8505-7c28c3e8b4ff.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260701202716_c2df0eab-ffd2-4b59-b687-4ee2f8433e55.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260701215650_2d93edf6-6bd2-4504-aace-8f74f08c67f8.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260702034259_23a6e4cd-698a-468c-bac0-47945cfcc239.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260702052021_ad015fd7-f374-4b7e-93cb-fb6605b50587.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260702171839_ec000826-f903-4cf6-a156-9058e8311965.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260702175343_acd997e7-995f-41a6-b717-37159802e0a4.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260702193734_dbbf5a06-1887-4837-bcec-c040c4ccdaaf.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260702194639_24255401-3ea4-435f-8637-382da617bcc4.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260702195319_14b26a0b-80bb-4062-99ec-fd176c54e684.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260702222447_db9f1590-7e56-4b51-8308-15b1fe909720.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260724060831_8909ced7-d162-4511-ad54-88aa195c037c.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "静态敏感信息筛查不是完整安全审计；动态资产、外部服务及目标平台权限需要人工核对。"
      ],
      "cycles": [],
      "configuration": [
        "LOVABLE_API_KEY"
      ],
      "dependencies": [
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
      "database": [
        "products",
        "cases",
        "site_settings",
        "pages",
        "tool_categories",
        "tool_items"
      ],
      "installable": false,
      "canExport": true
    },
    {
      "id": "solution-builder",
      "name": "Solution Builder",
      "version": "0.0.0-source-snapshot",
      "digest": "cb11d512643892c78398a9cbc3e6559dffa902121f61de74d6ad5a05cfec86a5",
      "bytes": 1065691,
      "files": [
        {
          "path": "src/assets/service-business-platforms.jpg",
          "sourcePath": "src/assets/service-business-platforms.jpg",
          "kind": "asset",
          "bytes": 140119,
          "sha256": "4733e025a724357656c376b61adfa2f7ff4d7575708936c99170fe73ec32e96a"
        },
        {
          "path": "src/assets/service-cloud-deployment.jpg",
          "sourcePath": "src/assets/service-cloud-deployment.jpg",
          "kind": "asset",
          "bytes": 137121,
          "sha256": "09e7a5f28857547a68f15211f1484d98b5a813a4b46e67b2a43da99585462f04"
        },
        {
          "path": "src/assets/service-custom-software.jpg",
          "sourcePath": "src/assets/service-custom-software.jpg",
          "kind": "asset",
          "bytes": 131429,
          "sha256": "94d6fc2e364c17e9162ff5977d79ac08c06d691820388fc9e5ab7871f008b576"
        },
        {
          "path": "src/assets/service-home-media.jpg",
          "sourcePath": "src/assets/service-home-media.jpg",
          "kind": "asset",
          "bytes": 153051,
          "sha256": "5ab29a1cd169fbdc917f713d59cd543cd81f976982ddaf8a718d3fe5380871c9"
        },
        {
          "path": "src/assets/service-home-network.jpg",
          "sourcePath": "src/assets/service-home-network.jpg",
          "kind": "asset",
          "bytes": 136120,
          "sha256": "bba6cf864bd2a22c5533320e29a9ce2104c34799833c885885d29b4d4e43e4dc"
        },
        {
          "path": "src/assets/service-nas.jpg",
          "sourcePath": "src/assets/service-nas.jpg",
          "kind": "asset",
          "bytes": 147867,
          "sha256": "d0761bb6777ca8537bc80096818aae86833ab29ae06bb071c07062122f3e8a7f"
        },
        {
          "path": "src/assets/service-smart-home.jpg",
          "sourcePath": "src/assets/service-smart-home.jpg",
          "kind": "asset",
          "bytes": 123936,
          "sha256": "e6b54101a27c481fe46dbacf71738c07e9174e36acbae64ff4ee66b545338ba8"
        },
        {
          "path": "src/assets/service-websites.jpg",
          "sourcePath": "src/assets/service-websites.jpg",
          "kind": "asset",
          "bytes": 165323,
          "sha256": "c925841def888e21a5007873612a45cdadc8806c7176638f9e40ac0b60882029"
        },
        {
          "path": "src/components/solution-builder/BuilderShell.tsx",
          "sourcePath": "src/components/solution-builder/BuilderShell.tsx",
          "kind": "private",
          "bytes": 21538,
          "sha256": "a25d49efb30181115c63d2672ff84472342b8b3aa460886ed91db9adf9b5b744"
        },
        {
          "path": "src/components/solution-builder/SubmitDialog.tsx",
          "sourcePath": "src/components/solution-builder/SubmitDialog.tsx",
          "kind": "private",
          "bytes": 3811,
          "sha256": "b33b6d940a6ff27034daf8965e350b88e981e3092e255bbff4964caf2104b0b0"
        },
        {
          "path": "src/components/solution-builder/builderHelpers.ts",
          "sourcePath": "src/components/solution-builder/builderHelpers.ts",
          "kind": "private",
          "bytes": 2422,
          "sha256": "3bb1903488bcfd243ee530316286d1ba5e8639f3d676d06b3cab76fd97b11c12"
        },
        {
          "path": "src/components/solution-builder/pdf.ts",
          "sourcePath": "src/components/solution-builder/pdf.ts",
          "kind": "private",
          "bytes": 9334,
          "sha256": "55c083db2f4bd81971e18318abd9131e935112aa28a0bbf948b9259ea197d2cc"
        },
        {
          "path": "src/components/solution-builder/pdfFontLoader.ts",
          "sourcePath": "src/components/solution-builder/pdfFontLoader.ts",
          "kind": "private",
          "bytes": 2517,
          "sha256": "cff239eef6e1a09cfdcac8172d6adf6a52543c06d7938d50c5352aaad337f719"
        },
        {
          "path": "src/components/ui/button.tsx",
          "sourcePath": "src/components/ui/button.tsx",
          "kind": "shared",
          "bytes": 1894,
          "sha256": "e39813b666ba434660ec088356a0349246b6803a4e99961295d0c82bab1ab862"
        },
        {
          "path": "src/components/ui/dialog.tsx",
          "sourcePath": "src/components/ui/dialog.tsx",
          "kind": "shared",
          "bytes": 3648,
          "sha256": "e3a6de153fb15597ea95be9c4549211a297c060267787915599e3d680d476bd9"
        },
        {
          "path": "src/components/ui/input.tsx",
          "sourcePath": "src/components/ui/input.tsx",
          "kind": "shared",
          "bytes": 776,
          "sha256": "92debb7d6d2d96d9e607a42d5ce8f37b2d63384ae5dd9ffbbf5f047b680ffb85"
        },
        {
          "path": "src/components/ui/label.tsx",
          "sourcePath": "src/components/ui/label.tsx",
          "kind": "shared",
          "bytes": 716,
          "sha256": "9f72e2ecf16206593aa9e3c4fbc14cd8e81aa8488d57d92d4a950b30935a9fa9"
        },
        {
          "path": "src/components/ui/navigation-menu.tsx",
          "sourcePath": "src/components/ui/navigation-menu.tsx",
          "kind": "shared",
          "bytes": 5152,
          "sha256": "755aecc77b7911ab61159c9fbb9b25254009eb4c32c95b1430b6b5b7d37ed8f0"
        },
        {
          "path": "src/components/ui/sheet.tsx",
          "sourcePath": "src/components/ui/sheet.tsx",
          "kind": "shared",
          "bytes": 4248,
          "sha256": "a82f9341962e766ee925a2fe883b0a9ab5d5dd8475c402ac8e491ee37dc95fde"
        },
        {
          "path": "src/components/ui/sonner.tsx",
          "sourcePath": "src/components/ui/sonner.tsx",
          "kind": "shared",
          "bytes": 734,
          "sha256": "3ad40f66c339e799b1a57c00e10b4627294c7d580d99d8a48ae0d8d4c13cf931"
        },
        {
          "path": "src/components/ui/textarea.tsx",
          "sourcePath": "src/components/ui/textarea.tsx",
          "kind": "shared",
          "bytes": 677,
          "sha256": "35617a2cf053e52c9e56983bde82d556861d38e462f9e578876c8e99a0432687"
        },
        {
          "path": "src/lib/cms.functions.ts",
          "sourcePath": "src/lib/cms.functions.ts",
          "kind": "shared",
          "bytes": 9457,
          "sha256": "0a9390bc00c78f23850bc6909946f54d3f4b461df56f70f090e866ed4db1db1d"
        },
        {
          "path": "src/lib/i18n.tsx",
          "sourcePath": "src/lib/i18n.tsx",
          "kind": "shared",
          "bytes": 12454,
          "sha256": "15d6ec8a275563b5578c5a65d060b22b25879bb4f269baba6597c924453a2697"
        },
        {
          "path": "src/lib/platform-bootstrap.tsx",
          "sourcePath": "src/lib/platform-bootstrap.tsx",
          "kind": "shared",
          "bytes": 2943,
          "sha256": "d73032adeff5e437abfe228493afaccee42ba374f9e7d63a2e09687be8283a43"
        },
        {
          "path": "src/lib/platform.ts",
          "sourcePath": "src/lib/platform.ts",
          "kind": "shared",
          "bytes": 849,
          "sha256": "39b54b38469b810cf0c79ad371c71c3d697f28b847b8b1eddfebd8eb0a80a081"
        },
        {
          "path": "src/lib/services-data.ts",
          "sourcePath": "src/lib/services-data.ts",
          "kind": "shared",
          "bytes": 16228,
          "sha256": "626b414329846937b859c9244df323b968aabf431f0c1cf84cf3683e5bccb676"
        },
        {
          "path": "src/lib/solution-builder.functions.ts",
          "sourcePath": "src/lib/solution-builder.functions.ts",
          "kind": "private",
          "bytes": 36623,
          "sha256": "7cf37017fbd2a6b9849e30ef31e6502d6370d8e61e8811701266e38d6040428c"
        },
        {
          "path": "src/lib/solution-builder/calc.ts",
          "sourcePath": "src/lib/solution-builder/calc.ts",
          "kind": "private",
          "bytes": 5005,
          "sha256": "848503f022f95ce240a703594e31d5d01c2db2ed2239c13b421a5f85b5f2031e"
        },
        {
          "path": "src/lib/solution-builder/compat.ts",
          "sourcePath": "src/lib/solution-builder/compat.ts",
          "kind": "private",
          "bytes": 13445,
          "sha256": "ef6138eac98b6408af7d8cd88782aa2150023c82754c223b4a9e21ac0756418c"
        },
        {
          "path": "src/lib/solution-builder/i18n.ts",
          "sourcePath": "src/lib/solution-builder/i18n.ts",
          "kind": "private",
          "bytes": 4533,
          "sha256": "94a31480ccbb41ffa49b306300965a9a226ad66650ce5f78d500501f23932baa"
        },
        {
          "path": "src/lib/solution-builder/types.ts",
          "sourcePath": "src/lib/solution-builder/types.ts",
          "kind": "private",
          "bytes": 5239,
          "sha256": "bec552c9f44402fe94b221578e9ddca7c8a98dd8b0084f41f54a01b0ae852c80"
        },
        {
          "path": "src/lib/utils.ts",
          "sourcePath": "src/lib/utils.ts",
          "kind": "shared",
          "bytes": 169,
          "sha256": "d1f1e0d62cb8d8d1e04c26e14de842d8a151f75812d81b046c65b5d1fe8e4b27"
        },
        {
          "path": "src/routes/tools.solution-builder.index.tsx",
          "sourcePath": "src/routes/tools.solution-builder.index.tsx",
          "kind": "private",
          "bytes": 3596,
          "sha256": "797bc7e2b96b65c41c93d7c7cc0c999a5c2ab755029f0119bfeada7195d8fafc"
        },
        {
          "path": "src/styles.css",
          "sourcePath": "src/styles.css",
          "kind": "shared",
          "bytes": 5655,
          "sha256": "29f12b25c7c28934469eaf4924edc1ff43e31d36cbf7b1314ef36351c850e99f"
        },
        {
          "path": "database/migrations/20260605025102_b5a1855f-984a-411a-a705-bf46012dc5b6.sql",
          "sourcePath": "supabase/migrations/20260605025102_b5a1855f-984a-411a-a705-bf46012dc5b6.sql",
          "kind": "migration",
          "bytes": 4351,
          "sha256": "12798c573bd36ceabed75e19294cf4e6f0550babe09b4aba18a1d598ca7fba08"
        },
        {
          "path": "database/migrations/20260605041915_f2084296-4115-4972-9522-4f2f8b6d2663.sql",
          "sourcePath": "supabase/migrations/20260605041915_f2084296-4115-4972-9522-4f2f8b6d2663.sql",
          "kind": "migration",
          "bytes": 1751,
          "sha256": "39fc2b66002fc13c63e8bae428083c82fd48d54c1cac5278d35832eb46027a7d"
        },
        {
          "path": "database/migrations/20260605042003_6cd94604-6df1-416c-96e1-e1d8258c5bb8.sql",
          "sourcePath": "supabase/migrations/20260605042003_6cd94604-6df1-416c-96e1-e1d8258c5bb8.sql",
          "kind": "migration",
          "bytes": 949,
          "sha256": "110b3de24b828d9bb32d49a84887110ab2394fabb8185c91d079bf86743bca6c"
        },
        {
          "path": "database/migrations/20260605042145_9830a646-87e5-4bb2-9cba-3b95566dffee.sql",
          "sourcePath": "supabase/migrations/20260605042145_9830a646-87e5-4bb2-9cba-3b95566dffee.sql",
          "kind": "migration",
          "bytes": 576,
          "sha256": "ab5cfaaa796d5926325ae92b53c16c2013ec508792c3e6de9a5ec51721435fef"
        },
        {
          "path": "database/migrations/20260701150020_80a3f5d8-f7c2-4c48-a7a7-2167b418c679.sql",
          "sourcePath": "supabase/migrations/20260701150020_80a3f5d8-f7c2-4c48-a7a7-2167b418c679.sql",
          "kind": "migration",
          "bytes": 1230,
          "sha256": "7b4cc4a4686b122a11bbaf7093c33971a0ae7c8461b937d421544df46b93a14d"
        },
        {
          "path": "database/migrations/20260701155726_58964244-bc02-4244-8029-cb2bbb228957.sql",
          "sourcePath": "supabase/migrations/20260701155726_58964244-bc02-4244-8029-cb2bbb228957.sql",
          "kind": "migration",
          "bytes": 2995,
          "sha256": "10d64474d4de50d5940192d7398a8e1982a5b94c69248415452e9fb303fb8a19"
        },
        {
          "path": "database/migrations/20260701161506_bf4d7def-5e05-41ba-84d7-4e99337f4f76.sql",
          "sourcePath": "supabase/migrations/20260701161506_bf4d7def-5e05-41ba-84d7-4e99337f4f76.sql",
          "kind": "migration",
          "bytes": 117,
          "sha256": "47770537c164a2f9a959362fc63abfa2c2d00c46d01aca532f868848faf15383"
        },
        {
          "path": "database/migrations/20260701200509_6225bdc7-d2b4-4fb7-b94d-3eed26d19051.sql",
          "sourcePath": "supabase/migrations/20260701200509_6225bdc7-d2b4-4fb7-b94d-3eed26d19051.sql",
          "kind": "migration",
          "bytes": 65,
          "sha256": "8c3732a1a7dea2a787bd77f8ccfad29dfa5ab6170c3f13c838721d7f550f1744"
        },
        {
          "path": "database/migrations/20260701210729_fcbce524-68f8-48a6-8bc2-1b360d9efe14.sql",
          "sourcePath": "supabase/migrations/20260701210729_fcbce524-68f8-48a6-8bc2-1b360d9efe14.sql",
          "kind": "migration",
          "bytes": 210,
          "sha256": "c45496b7126a4937110d16e7ab388340391f632f65a57f285d47c2c7094470dc"
        },
        {
          "path": "database/migrations/20260701215012_6ba6ffd4-687d-4966-8afd-fa0b11393e46.sql",
          "sourcePath": "supabase/migrations/20260701215012_6ba6ffd4-687d-4966-8afd-fa0b11393e46.sql",
          "kind": "migration",
          "bytes": 769,
          "sha256": "5e91ba5a08afb5bb922cc55fccac337644a04058557a9c5d6701e57ab5a1e5b6"
        },
        {
          "path": "database/migrations/20260702044927_af2e4621-3eeb-4d52-be59-ee5dfa9f8433.sql",
          "sourcePath": "supabase/migrations/20260702044927_af2e4621-3eeb-4d52-be59-ee5dfa9f8433.sql",
          "kind": "migration",
          "bytes": 2418,
          "sha256": "c66808bdfb3672384993519844e51b6ad96e565687034ab045f228bd06313f5c"
        },
        {
          "path": "database/migrations/20260702050253_0249cd05-9bd8-4fb3-bfb4-9caabeb03807.sql",
          "sourcePath": "supabase/migrations/20260702050253_0249cd05-9bd8-4fb3-bfb4-9caabeb03807.sql",
          "kind": "migration",
          "bytes": 104,
          "sha256": "be2486bd19932e8154b555eccde7271f6a29134694ebad92b49c6b2a4709f55f"
        },
        {
          "path": "database/migrations/20260702204434_3ba0bda5-3c2c-469a-a2bb-21f7ff6bd9b3.sql",
          "sourcePath": "supabase/migrations/20260702204434_3ba0bda5-3c2c-469a-a2bb-21f7ff6bd9b3.sql",
          "kind": "migration",
          "bytes": 315,
          "sha256": "afa3fbae38b518c4f5553ef7bc1711d600923a228e5a592761bbb55ca9eb48a4"
        },
        {
          "path": "database/migrations/20260702222743_c25634c7-0413-4941-b766-81e586bb9565.sql",
          "sourcePath": "supabase/migrations/20260702222743_c25634c7-0413-4941-b766-81e586bb9565.sql",
          "kind": "migration",
          "bytes": 505,
          "sha256": "539374c2eee2c9638d45300ea0f2aed80d8da5754d7be38d8ff5f1c7a1e6ebfe"
        },
        {
          "path": "database/migrations/20260706213857_0a448fd2-0a80-4403-8652-24163babc902.sql",
          "sourcePath": "supabase/migrations/20260706213857_0a448fd2-0a80-4403-8652-24163babc902.sql",
          "kind": "migration",
          "bytes": 2139,
          "sha256": "94c36ad26fab3e188a45ce7624617745d556ea49f8e40e0c540217caf8760a7f"
        },
        {
          "path": "database/migrations/20260724063833_3e42d9ad-4623-406c-9cd0-f5029f794c2c.sql",
          "sourcePath": "supabase/migrations/20260724063833_3e42d9ad-4623-406c-9cd0-f5029f794c2c.sql",
          "kind": "migration",
          "bytes": 1864,
          "sha256": "03cdb2279ef4af58094cf756a7b544636a55867d93cec90c9d3ea57f18be3ac0"
        },
        {
          "path": "database/migrations/20260724064024_8885f743-d651-4f09-a4c7-fbd768e31651.sql",
          "sourcePath": "supabase/migrations/20260724064024_8885f743-d651-4f09-a4c7-fbd768e31651.sql",
          "kind": "migration",
          "bytes": 4697,
          "sha256": "cf7e9ed21aca68933c8826bcbfca7ce948f8ba923fb9518c93fd55d3ef90aba8"
        },
        {
          "path": "database/migrations/20260724070041_f40d8a2b-e2ef-480b-9465-bb7e207baed7.sql",
          "sourcePath": "supabase/migrations/20260724070041_f40d8a2b-e2ef-480b-9465-bb7e207baed7.sql",
          "kind": "migration",
          "bytes": 311,
          "sha256": "ea31cce947b5f26dc44bbe048fb4119fefff06ffcc1cded1f14e63bb02cecea4"
        }
      ],
      "excluded": [
        {
          "path": "src/components/SiteLayout.tsx",
          "reason": "硬编码敏感凭据"
        },
        {
          "path": "src/integrations/supabase/auth-middleware.ts",
          "reason": "平台连接配置、资产指针或受限制路径；目标平台需提供"
        },
        {
          "path": "src/integrations/supabase/client.server.ts",
          "reason": "平台连接配置、资产指针或受限制路径；目标平台需提供"
        },
        {
          "path": "src/integrations/supabase/client.ts",
          "reason": "平台连接配置、资产指针或受限制路径；目标平台需提供"
        },
        {
          "path": "src/integrations/supabase/previewAuthStorage.ts",
          "reason": "平台连接配置、资产指针或受限制路径；目标平台需提供"
        },
        {
          "path": "src/integrations/supabase/public-server.ts",
          "reason": "平台连接配置、资产指针或受限制路径；目标平台需提供"
        },
        {
          "path": "src/integrations/supabase/types.ts",
          "reason": "平台连接配置、资产指针或受限制路径；目标平台需提供"
        },
        {
          "path": "supabase/migrations/20260605041821_89193d7f-8534-4876-9f51-9d5b4f24528c.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260701195651_d1d7d914-47a0-40ee-8505-7c28c3e8b4ff.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260701202716_c2df0eab-ffd2-4b59-b687-4ee2f8433e55.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260701215650_2d93edf6-6bd2-4504-aace-8f74f08c67f8.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260702034259_23a6e4cd-698a-468c-bac0-47945cfcc239.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260702052021_ad015fd7-f374-4b7e-93cb-fb6605b50587.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260702171839_ec000826-f903-4cf6-a156-9058e8311965.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260702175343_acd997e7-995f-41a6-b717-37159802e0a4.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260702193734_dbbf5a06-1887-4837-bcec-c040c4ccdaaf.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260702194639_24255401-3ea4-435f-8637-382da617bcc4.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260702195319_14b26a0b-80bb-4062-99ec-fd176c54e684.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260702222447_db9f1590-7e56-4b51-8308-15b1fe909720.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260724043025_d9a89132-189e-4df5-af6c-1cf1fcdd8798.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260724060831_8909ced7-d162-4511-ad54-88aa195c037c.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        },
        {
          "path": "supabase/migrations/20260724071106_3866f694-58e0-4151-b479-106095a4f81f.sql",
          "reason": "历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化"
        }
      ],
      "errors": [],
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。",
        "需要核对 Lovable Cloud 表结构、SQL 函数、RLS 与历史迁移；不包含任何记录。",
        "包含登录或管理员权限依赖；目标项目需提供兼容的认证及角色机制。",
        "这是实际源代码审查包，不是已验证的独立可安装插件；installable 始终为 false。",
        "源文件按原路径包含；资产保留 src/assets 相对位置以避免破坏引用。",
        "src/components/SiteLayout.tsx：硬编码敏感凭据",
        "src/integrations/supabase/auth-middleware.ts：平台连接配置、资产指针或受限制路径；目标平台需提供",
        "src/integrations/supabase/client.server.ts：平台连接配置、资产指针或受限制路径；目标平台需提供",
        "src/integrations/supabase/client.ts：平台连接配置、资产指针或受限制路径；目标平台需提供",
        "src/integrations/supabase/previewAuthStorage.ts：平台连接配置、资产指针或受限制路径；目标平台需提供",
        "src/integrations/supabase/public-server.ts：平台连接配置、资产指针或受限制路径；目标平台需提供",
        "src/integrations/supabase/types.ts：平台连接配置、资产指针或受限制路径；目标平台需提供",
        "supabase/migrations/20260605041821_89193d7f-8534-4876-9f51-9d5b4f24528c.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260701195651_d1d7d914-47a0-40ee-8505-7c28c3e8b4ff.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260701202716_c2df0eab-ffd2-4b59-b687-4ee2f8433e55.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260701215650_2d93edf6-6bd2-4504-aace-8f74f08c67f8.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260702034259_23a6e4cd-698a-468c-bac0-47945cfcc239.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260702052021_ad015fd7-f374-4b7e-93cb-fb6605b50587.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260702171839_ec000826-f903-4cf6-a156-9058e8311965.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260702175343_acd997e7-995f-41a6-b717-37159802e0a4.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260702193734_dbbf5a06-1887-4837-bcec-c040c4ccdaaf.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260702194639_24255401-3ea4-435f-8637-382da617bcc4.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260702195319_14b26a0b-80bb-4062-99ec-fd176c54e684.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260702222447_db9f1590-7e56-4b51-8308-15b1fe909720.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260724043025_d9a89132-189e-4df5-af6c-1cf1fcdd8798.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260724060831_8909ced7-d162-4511-ad54-88aa195c037c.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "supabase/migrations/20260724071106_3866f694-58e0-4151-b479-106095a4f81f.sql：历史迁移包含数据写入；仅记录引用，不导出数据或角色初始化",
        "静态敏感信息筛查不是完整安全审计；动态资产、外部服务及目标平台权限需要人工核对。"
      ],
      "cycles": [],
      "configuration": [
        "SUPABASE_PUBLISHABLE_KEY",
        "SUPABASE_URL"
      ],
      "dependencies": [
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
      "database": [
        "sb_products",
        "solution_compatibility_rules",
        "sb_settings",
        "sb_solutions",
        "solution_product_brands",
        "solution_product_categories",
        "solution_price_history",
        "user_roles",
        "products",
        "cases",
        "site_settings",
        "pages",
        "tool_categories",
        "tool_items"
      ],
      "installable": false,
      "canExport": true
    },
    {
      "id": "ai-tools",
      "name": "AI 助手",
      "version": "0.0.0-source-snapshot",
      "digest": "1b27f3fe8b0eeb6efd56839e88a5b74e283ca922e9582dc07a298d08060a1a29",
      "bytes": 17152,
      "files": [
        {
          "path": "src/components/ai/AiToolByKey.tsx",
          "sourcePath": "src/components/ai/AiToolByKey.tsx",
          "kind": "private",
          "bytes": 19651,
          "sha256": "4b4874d0c0b1b5e24b696ec3bc442fd4113fb99f74eb30c802d88af0b365b487"
        },
        {
          "path": "src/components/ui/button.tsx",
          "sourcePath": "src/components/ui/button.tsx",
          "kind": "shared",
          "bytes": 1894,
          "sha256": "e39813b666ba434660ec088356a0349246b6803a4e99961295d0c82bab1ab862"
        },
        {
          "path": "src/components/ui/input.tsx",
          "sourcePath": "src/components/ui/input.tsx",
          "kind": "shared",
          "bytes": 776,
          "sha256": "92debb7d6d2d96d9e607a42d5ce8f37b2d63384ae5dd9ffbbf5f047b680ffb85"
        },
        {
          "path": "src/components/ui/label.tsx",
          "sourcePath": "src/components/ui/label.tsx",
          "kind": "shared",
          "bytes": 716,
          "sha256": "9f72e2ecf16206593aa9e3c4fbc14cd8e81aa8488d57d92d4a950b30935a9fa9"
        },
        {
          "path": "src/components/ui/textarea.tsx",
          "sourcePath": "src/components/ui/textarea.tsx",
          "kind": "shared",
          "bytes": 677,
          "sha256": "35617a2cf053e52c9e56983bde82d556861d38e462f9e578876c8e99a0432687"
        },
        {
          "path": "src/lib/ai.functions.ts",
          "sourcePath": "src/lib/ai.functions.ts",
          "kind": "private",
          "bytes": 2099,
          "sha256": "b5f792edfd887cbccb6f99a8540741b35efb13d50c248ef7c4ec74228d212133"
        },
        {
          "path": "src/lib/utils.ts",
          "sourcePath": "src/lib/utils.ts",
          "kind": "shared",
          "bytes": 169,
          "sha256": "d1f1e0d62cb8d8d1e04c26e14de842d8a151f75812d81b046c65b5d1fe8e4b27"
        },
        {
          "path": "src/styles.css",
          "sourcePath": "src/styles.css",
          "kind": "shared",
          "bytes": 5655,
          "sha256": "29f12b25c7c28934469eaf4924edc1ff43e31d36cbf7b1314ef36351c850e99f"
        }
      ],
      "excluded": [],
      "errors": [],
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。",
        "依赖目标平台的 AI Gateway 凭据与服务额度；清单不包含密钥。",
        "这是实际源代码审查包，不是已验证的独立可安装插件；installable 始终为 false。",
        "源文件按原路径包含；资产保留 src/assets 相对位置以避免破坏引用。",
        "静态敏感信息筛查不是完整安全审计；动态资产、外部服务及目标平台权限需要人工核对。"
      ],
      "cycles": [],
      "configuration": [
        "LOVABLE_API_KEY"
      ],
      "dependencies": [
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
      "database": [],
      "installable": false,
      "canExport": true
    },
    {
      "id": "dev-tools",
      "name": "开发工具",
      "version": "0.0.0-source-snapshot",
      "digest": "58ffe608877028275bae605106ee6e5c5f81aceab78345feabe0b773cc53a877",
      "bytes": 18530,
      "files": [
        {
          "path": "src/components/tools/DevTool.tsx",
          "sourcePath": "src/components/tools/DevTool.tsx",
          "kind": "private",
          "bytes": 28073,
          "sha256": "ad643df44c89ce872f3de89f00bc6fdfc3f4d19b80d38adbe6d46fdd2bfe47d2"
        },
        {
          "path": "src/components/tools/ToolShell.tsx",
          "sourcePath": "src/components/tools/ToolShell.tsx",
          "kind": "shared",
          "bytes": 2768,
          "sha256": "24227b64a014adc82ed8ed4cd463d2fef1a33a46d9ad3c41f39f90fea73ed2c3"
        },
        {
          "path": "src/components/ui/button.tsx",
          "sourcePath": "src/components/ui/button.tsx",
          "kind": "shared",
          "bytes": 1894,
          "sha256": "e39813b666ba434660ec088356a0349246b6803a4e99961295d0c82bab1ab862"
        },
        {
          "path": "src/components/ui/input.tsx",
          "sourcePath": "src/components/ui/input.tsx",
          "kind": "shared",
          "bytes": 776,
          "sha256": "92debb7d6d2d96d9e607a42d5ce8f37b2d63384ae5dd9ffbbf5f047b680ffb85"
        },
        {
          "path": "src/components/ui/textarea.tsx",
          "sourcePath": "src/components/ui/textarea.tsx",
          "kind": "shared",
          "bytes": 677,
          "sha256": "35617a2cf053e52c9e56983bde82d556861d38e462f9e578876c8e99a0432687"
        },
        {
          "path": "src/lib/utils.ts",
          "sourcePath": "src/lib/utils.ts",
          "kind": "shared",
          "bytes": 169,
          "sha256": "d1f1e0d62cb8d8d1e04c26e14de842d8a151f75812d81b046c65b5d1fe8e4b27"
        },
        {
          "path": "src/styles.css",
          "sourcePath": "src/styles.css",
          "kind": "shared",
          "bytes": 5655,
          "sha256": "29f12b25c7c28934469eaf4924edc1ff43e31d36cbf7b1314ef36351c850e99f"
        }
      ],
      "excluded": [],
      "errors": [],
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。",
        "这是实际源代码审查包，不是已验证的独立可安装插件；installable 始终为 false。",
        "源文件按原路径包含；资产保留 src/assets 相对位置以避免破坏引用。",
        "静态敏感信息筛查不是完整安全审计；动态资产、外部服务及目标平台权限需要人工核对。"
      ],
      "cycles": [],
      "configuration": [],
      "dependencies": [
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
      "database": [],
      "installable": false,
      "canExport": true
    },
    {
      "id": "text-tools",
      "name": "文本工具",
      "version": "0.0.0-source-snapshot",
      "digest": "2d87b062015fa2543c9e0181e074323f683c6347a4f914f8480947889e3f95ca",
      "bytes": 15662,
      "files": [
        {
          "path": "src/components/tools/TextTool.tsx",
          "sourcePath": "src/components/tools/TextTool.tsx",
          "kind": "private",
          "bytes": 17800,
          "sha256": "280947a85c5e823f9161166e24785bc6c43124d0537f74887fbd424a4ac4b4f8"
        },
        {
          "path": "src/components/tools/ToolShell.tsx",
          "sourcePath": "src/components/tools/ToolShell.tsx",
          "kind": "shared",
          "bytes": 2768,
          "sha256": "24227b64a014adc82ed8ed4cd463d2fef1a33a46d9ad3c41f39f90fea73ed2c3"
        },
        {
          "path": "src/components/ui/button.tsx",
          "sourcePath": "src/components/ui/button.tsx",
          "kind": "shared",
          "bytes": 1894,
          "sha256": "e39813b666ba434660ec088356a0349246b6803a4e99961295d0c82bab1ab862"
        },
        {
          "path": "src/components/ui/textarea.tsx",
          "sourcePath": "src/components/ui/textarea.tsx",
          "kind": "shared",
          "bytes": 677,
          "sha256": "35617a2cf053e52c9e56983bde82d556861d38e462f9e578876c8e99a0432687"
        },
        {
          "path": "src/lib/utils.ts",
          "sourcePath": "src/lib/utils.ts",
          "kind": "shared",
          "bytes": 169,
          "sha256": "d1f1e0d62cb8d8d1e04c26e14de842d8a151f75812d81b046c65b5d1fe8e4b27"
        },
        {
          "path": "src/styles.css",
          "sourcePath": "src/styles.css",
          "kind": "shared",
          "bytes": 5655,
          "sha256": "29f12b25c7c28934469eaf4924edc1ff43e31d36cbf7b1314ef36351c850e99f"
        }
      ],
      "excluded": [],
      "errors": [],
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。",
        "这是实际源代码审查包，不是已验证的独立可安装插件；installable 始终为 false。",
        "源文件按原路径包含；资产保留 src/assets 相对位置以避免破坏引用。",
        "静态敏感信息筛查不是完整安全审计；动态资产、外部服务及目标平台权限需要人工核对。"
      ],
      "cycles": [],
      "configuration": [],
      "dependencies": [
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
      "database": [],
      "installable": false,
      "canExport": true
    },
    {
      "id": "image-tools",
      "name": "图片工具",
      "version": "0.0.0-source-snapshot",
      "digest": "f7dafb7264a29ed95a29b4bb6c6b350132b94373aedb4f2b8bb1654d9cc7c0b9",
      "bytes": 17959,
      "files": [
        {
          "path": "src/components/tools/FileDrop.tsx",
          "sourcePath": "src/components/tools/FileDrop.tsx",
          "kind": "shared",
          "bytes": 3253,
          "sha256": "101845f6010db365232ebed3e4fca2faf975fbb214fc517bd30388df150bac57"
        },
        {
          "path": "src/components/tools/ImageTool.tsx",
          "sourcePath": "src/components/tools/ImageTool.tsx",
          "kind": "private",
          "bytes": 21525,
          "sha256": "7ce815739b7107d113ef4eb72bf362fcfc51c5041ad399e4548eb0a6f0ede088"
        },
        {
          "path": "src/components/tools/ToolShell.tsx",
          "sourcePath": "src/components/tools/ToolShell.tsx",
          "kind": "shared",
          "bytes": 2768,
          "sha256": "24227b64a014adc82ed8ed4cd463d2fef1a33a46d9ad3c41f39f90fea73ed2c3"
        },
        {
          "path": "src/components/ui/button.tsx",
          "sourcePath": "src/components/ui/button.tsx",
          "kind": "shared",
          "bytes": 1894,
          "sha256": "e39813b666ba434660ec088356a0349246b6803a4e99961295d0c82bab1ab862"
        },
        {
          "path": "src/lib/tools/ico.ts",
          "sourcePath": "src/lib/tools/ico.ts",
          "kind": "private",
          "bytes": 1225,
          "sha256": "8e470eb492e6e74718c793d616fff2031a36bac810287895167fd63e7cf52a8c"
        },
        {
          "path": "src/lib/utils.ts",
          "sourcePath": "src/lib/utils.ts",
          "kind": "shared",
          "bytes": 169,
          "sha256": "d1f1e0d62cb8d8d1e04c26e14de842d8a151f75812d81b046c65b5d1fe8e4b27"
        },
        {
          "path": "src/styles.css",
          "sourcePath": "src/styles.css",
          "kind": "shared",
          "bytes": 5655,
          "sha256": "29f12b25c7c28934469eaf4924edc1ff43e31d36cbf7b1314ef36351c850e99f"
        }
      ],
      "excluded": [],
      "errors": [],
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。",
        "这是实际源代码审查包，不是已验证的独立可安装插件；installable 始终为 false。",
        "源文件按原路径包含；资产保留 src/assets 相对位置以避免破坏引用。",
        "静态敏感信息筛查不是完整安全审计；动态资产、外部服务及目标平台权限需要人工核对。"
      ],
      "cycles": [],
      "configuration": [],
      "dependencies": [
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
      "database": [],
      "installable": false,
      "canExport": true
    },
    {
      "id": "pdf-tools",
      "name": "PDF 工具",
      "version": "0.0.0-source-snapshot",
      "digest": "62c8a1fcc39fd32be9b8008e49511c0c7af26194012810f879193ade6f905376",
      "bytes": 16228,
      "files": [
        {
          "path": "src/components/tools/FileDrop.tsx",
          "sourcePath": "src/components/tools/FileDrop.tsx",
          "kind": "shared",
          "bytes": 3253,
          "sha256": "101845f6010db365232ebed3e4fca2faf975fbb214fc517bd30388df150bac57"
        },
        {
          "path": "src/components/tools/PdfTool.tsx",
          "sourcePath": "src/components/tools/PdfTool.tsx",
          "kind": "private",
          "bytes": 13533,
          "sha256": "92e20334ff16045e57bf7bf1cccf5402d812ce5be4e31d9e16862557714d8f11"
        },
        {
          "path": "src/components/tools/ToolShell.tsx",
          "sourcePath": "src/components/tools/ToolShell.tsx",
          "kind": "shared",
          "bytes": 2768,
          "sha256": "24227b64a014adc82ed8ed4cd463d2fef1a33a46d9ad3c41f39f90fea73ed2c3"
        },
        {
          "path": "src/components/ui/button.tsx",
          "sourcePath": "src/components/ui/button.tsx",
          "kind": "shared",
          "bytes": 1894,
          "sha256": "e39813b666ba434660ec088356a0349246b6803a4e99961295d0c82bab1ab862"
        },
        {
          "path": "src/lib/tools/pdfjs.ts",
          "sourcePath": "src/lib/tools/pdfjs.ts",
          "kind": "private",
          "bytes": 809,
          "sha256": "7f229a80b28066bc6729adb19f3544931abf936bf0b55d6510cd8061fd46bb3c"
        },
        {
          "path": "src/lib/utils.ts",
          "sourcePath": "src/lib/utils.ts",
          "kind": "shared",
          "bytes": 169,
          "sha256": "d1f1e0d62cb8d8d1e04c26e14de842d8a151f75812d81b046c65b5d1fe8e4b27"
        },
        {
          "path": "src/styles.css",
          "sourcePath": "src/styles.css",
          "kind": "shared",
          "bytes": 5655,
          "sha256": "29f12b25c7c28934469eaf4924edc1ff43e31d36cbf7b1314ef36351c850e99f"
        }
      ],
      "excluded": [],
      "errors": [],
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。",
        "这是实际源代码审查包，不是已验证的独立可安装插件；installable 始终为 false。",
        "源文件按原路径包含；资产保留 src/assets 相对位置以避免破坏引用。",
        "静态敏感信息筛查不是完整安全审计；动态资产、外部服务及目标平台权限需要人工核对。"
      ],
      "cycles": [],
      "configuration": [],
      "dependencies": [
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
      "database": [],
      "installable": false,
      "canExport": true
    },
    {
      "id": "file-hash",
      "name": "文件哈希",
      "version": "0.0.0-source-snapshot",
      "digest": "eb9dd1c6a1d636bd28d3fb75907e1cf165a5441b0edbf564588b36cad0fe00f0",
      "bytes": 12147,
      "files": [
        {
          "path": "src/components/tools/FileHashTool.tsx",
          "sourcePath": "src/components/tools/FileHashTool.tsx",
          "kind": "private",
          "bytes": 5637,
          "sha256": "e5093ae550d0cf78625b4f0d72e043bda229a58ba8ecd2f741ebd76c7edea695"
        },
        {
          "path": "src/components/tools/ToolShell.tsx",
          "sourcePath": "src/components/tools/ToolShell.tsx",
          "kind": "shared",
          "bytes": 2768,
          "sha256": "24227b64a014adc82ed8ed4cd463d2fef1a33a46d9ad3c41f39f90fea73ed2c3"
        },
        {
          "path": "src/components/ui/button.tsx",
          "sourcePath": "src/components/ui/button.tsx",
          "kind": "shared",
          "bytes": 1894,
          "sha256": "e39813b666ba434660ec088356a0349246b6803a4e99961295d0c82bab1ab862"
        },
        {
          "path": "src/components/ui/input.tsx",
          "sourcePath": "src/components/ui/input.tsx",
          "kind": "shared",
          "bytes": 776,
          "sha256": "92debb7d6d2d96d9e607a42d5ce8f37b2d63384ae5dd9ffbbf5f047b680ffb85"
        },
        {
          "path": "src/lib/utils.ts",
          "sourcePath": "src/lib/utils.ts",
          "kind": "shared",
          "bytes": 169,
          "sha256": "d1f1e0d62cb8d8d1e04c26e14de842d8a151f75812d81b046c65b5d1fe8e4b27"
        },
        {
          "path": "src/styles.css",
          "sourcePath": "src/styles.css",
          "kind": "shared",
          "bytes": 5655,
          "sha256": "29f12b25c7c28934469eaf4924edc1ff43e31d36cbf7b1314ef36351c850e99f"
        }
      ],
      "excluded": [],
      "errors": [],
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。",
        "这是实际源代码审查包，不是已验证的独立可安装插件；installable 始终为 false。",
        "源文件按原路径包含；资产保留 src/assets 相对位置以避免破坏引用。",
        "静态敏感信息筛查不是完整安全审计；动态资产、外部服务及目标平台权限需要人工核对。"
      ],
      "cycles": [],
      "configuration": [],
      "dependencies": [
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
      "database": [],
      "installable": false,
      "canExport": true
    },
    {
      "id": "network-tools",
      "name": "网络工具",
      "version": "0.0.0-source-snapshot",
      "digest": "9a3d779b49479aec57f461f103e443484423133829569b34393273f5f2667993",
      "bytes": 19659,
      "files": [
        {
          "path": "src/components/tools/LookupTool.tsx",
          "sourcePath": "src/components/tools/LookupTool.tsx",
          "kind": "shared",
          "bytes": 5035,
          "sha256": "5e9435f8c412b542a749d55582ba91401610bbcfd1fa719e726656f9fc3694a5"
        },
        {
          "path": "src/components/tools/NetworkTool.tsx",
          "sourcePath": "src/components/tools/NetworkTool.tsx",
          "kind": "private",
          "bytes": 13264,
          "sha256": "e00437af8a5f78ebba346e085921289a2d02fcbeea9ca3c70f4c170380d237aa"
        },
        {
          "path": "src/components/tools/ToolShell.tsx",
          "sourcePath": "src/components/tools/ToolShell.tsx",
          "kind": "shared",
          "bytes": 2768,
          "sha256": "24227b64a014adc82ed8ed4cd463d2fef1a33a46d9ad3c41f39f90fea73ed2c3"
        },
        {
          "path": "src/components/ui/button.tsx",
          "sourcePath": "src/components/ui/button.tsx",
          "kind": "shared",
          "bytes": 1894,
          "sha256": "e39813b666ba434660ec088356a0349246b6803a4e99961295d0c82bab1ab862"
        },
        {
          "path": "src/lib/network.functions.ts",
          "sourcePath": "src/lib/network.functions.ts",
          "kind": "private",
          "bytes": 10399,
          "sha256": "1d863b896e8181b10e01bfea3972a6e4e00e4c9b65ad2ef46a7f0603d22789db"
        },
        {
          "path": "src/lib/utils.ts",
          "sourcePath": "src/lib/utils.ts",
          "kind": "shared",
          "bytes": 169,
          "sha256": "d1f1e0d62cb8d8d1e04c26e14de842d8a151f75812d81b046c65b5d1fe8e4b27"
        },
        {
          "path": "src/styles.css",
          "sourcePath": "src/styles.css",
          "kind": "shared",
          "bytes": 5655,
          "sha256": "29f12b25c7c28934469eaf4924edc1ff43e31d36cbf7b1314ef36351c850e99f"
        }
      ],
      "excluded": [],
      "errors": [],
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。",
        "这是实际源代码审查包，不是已验证的独立可安装插件；installable 始终为 false。",
        "源文件按原路径包含；资产保留 src/assets 相对位置以避免破坏引用。",
        "模块耦合：lookup-tools",
        "静态敏感信息筛查不是完整安全审计；动态资产、外部服务及目标平台权限需要人工核对。"
      ],
      "cycles": [],
      "configuration": [],
      "dependencies": [
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
      "database": [],
      "installable": false,
      "canExport": true
    },
    {
      "id": "lookup-tools",
      "name": "查询工具",
      "version": "0.0.0-source-snapshot",
      "digest": "fe31c1f77ce4f10180fce7dcb05b3bdfc31eb4a86d17dbced866299f397f7a0a",
      "bytes": 11142,
      "files": [
        {
          "path": "src/components/tools/LookupTool.tsx",
          "sourcePath": "src/components/tools/LookupTool.tsx",
          "kind": "shared",
          "bytes": 5035,
          "sha256": "5e9435f8c412b542a749d55582ba91401610bbcfd1fa719e726656f9fc3694a5"
        },
        {
          "path": "src/components/tools/ToolShell.tsx",
          "sourcePath": "src/components/tools/ToolShell.tsx",
          "kind": "shared",
          "bytes": 2768,
          "sha256": "24227b64a014adc82ed8ed4cd463d2fef1a33a46d9ad3c41f39f90fea73ed2c3"
        },
        {
          "path": "src/components/ui/button.tsx",
          "sourcePath": "src/components/ui/button.tsx",
          "kind": "shared",
          "bytes": 1894,
          "sha256": "e39813b666ba434660ec088356a0349246b6803a4e99961295d0c82bab1ab862"
        },
        {
          "path": "src/lib/utils.ts",
          "sourcePath": "src/lib/utils.ts",
          "kind": "shared",
          "bytes": 169,
          "sha256": "d1f1e0d62cb8d8d1e04c26e14de842d8a151f75812d81b046c65b5d1fe8e4b27"
        },
        {
          "path": "src/styles.css",
          "sourcePath": "src/styles.css",
          "kind": "shared",
          "bytes": 5655,
          "sha256": "29f12b25c7c28934469eaf4924edc1ff43e31d36cbf7b1314ef36351c850e99f"
        }
      ],
      "excluded": [],
      "errors": [],
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。",
        "这是实际源代码审查包，不是已验证的独立可安装插件；installable 始终为 false。",
        "源文件按原路径包含；资产保留 src/assets 相对位置以避免破坏引用。",
        "静态敏感信息筛查不是完整安全审计；动态资产、外部服务及目标平台权限需要人工核对。"
      ],
      "cycles": [],
      "configuration": [],
      "dependencies": [
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
      "database": [],
      "installable": false,
      "canExport": true
    },
    {
      "id": "time-tools",
      "name": "时间工具",
      "version": "0.0.0-source-snapshot",
      "digest": "9d6ecbd921ea97033f9b4e6b8f0b01d7c35c72aae6bcc20d1a66861677a78030",
      "bytes": 14973,
      "files": [
        {
          "path": "src/components/tools/TimeTool.tsx",
          "sourcePath": "src/components/tools/TimeTool.tsx",
          "kind": "private",
          "bytes": 19504,
          "sha256": "cd56b2822d4091374bd32207b46f1d8a206d1c9f6e9ebda335b627bac680c890"
        },
        {
          "path": "src/components/tools/ToolShell.tsx",
          "sourcePath": "src/components/tools/ToolShell.tsx",
          "kind": "shared",
          "bytes": 2768,
          "sha256": "24227b64a014adc82ed8ed4cd463d2fef1a33a46d9ad3c41f39f90fea73ed2c3"
        },
        {
          "path": "src/components/ui/button.tsx",
          "sourcePath": "src/components/ui/button.tsx",
          "kind": "shared",
          "bytes": 1894,
          "sha256": "e39813b666ba434660ec088356a0349246b6803a4e99961295d0c82bab1ab862"
        },
        {
          "path": "src/components/ui/input.tsx",
          "sourcePath": "src/components/ui/input.tsx",
          "kind": "shared",
          "bytes": 776,
          "sha256": "92debb7d6d2d96d9e607a42d5ce8f37b2d63384ae5dd9ffbbf5f047b680ffb85"
        },
        {
          "path": "src/lib/utils.ts",
          "sourcePath": "src/lib/utils.ts",
          "kind": "shared",
          "bytes": 169,
          "sha256": "d1f1e0d62cb8d8d1e04c26e14de842d8a151f75812d81b046c65b5d1fe8e4b27"
        },
        {
          "path": "src/styles.css",
          "sourcePath": "src/styles.css",
          "kind": "shared",
          "bytes": 5655,
          "sha256": "29f12b25c7c28934469eaf4924edc1ff43e31d36cbf7b1314ef36351c850e99f"
        }
      ],
      "excluded": [],
      "errors": [],
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。",
        "这是实际源代码审查包，不是已验证的独立可安装插件；installable 始终为 false。",
        "源文件按原路径包含；资产保留 src/assets 相对位置以避免破坏引用。",
        "静态敏感信息筛查不是完整安全审计；动态资产、外部服务及目标平台权限需要人工核对。"
      ],
      "cycles": [],
      "configuration": [],
      "dependencies": [
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
      "database": [],
      "installable": false,
      "canExport": true
    },
    {
      "id": "simple-tools",
      "name": "通用实用工具",
      "version": "0.0.0-source-snapshot",
      "digest": "f268d482efd610c6b162d4c01c2f50b7b5059bb4a14d5065469369dc521648ac",
      "bytes": 16119,
      "files": [
        {
          "path": "src/components/tools/SimpleTool.tsx",
          "sourcePath": "src/components/tools/SimpleTool.tsx",
          "kind": "private",
          "bytes": 20775,
          "sha256": "b25f4e9d8e3e998cae74088ceff92bf36c1f114c237110567c32f2c8980c8ade"
        },
        {
          "path": "src/components/tools/ToolShell.tsx",
          "sourcePath": "src/components/tools/ToolShell.tsx",
          "kind": "shared",
          "bytes": 2768,
          "sha256": "24227b64a014adc82ed8ed4cd463d2fef1a33a46d9ad3c41f39f90fea73ed2c3"
        },
        {
          "path": "src/components/ui/button.tsx",
          "sourcePath": "src/components/ui/button.tsx",
          "kind": "shared",
          "bytes": 1894,
          "sha256": "e39813b666ba434660ec088356a0349246b6803a4e99961295d0c82bab1ab862"
        },
        {
          "path": "src/components/ui/input.tsx",
          "sourcePath": "src/components/ui/input.tsx",
          "kind": "shared",
          "bytes": 776,
          "sha256": "92debb7d6d2d96d9e607a42d5ce8f37b2d63384ae5dd9ffbbf5f047b680ffb85"
        },
        {
          "path": "src/lib/utils.ts",
          "sourcePath": "src/lib/utils.ts",
          "kind": "shared",
          "bytes": 169,
          "sha256": "d1f1e0d62cb8d8d1e04c26e14de842d8a151f75812d81b046c65b5d1fe8e4b27"
        },
        {
          "path": "src/styles.css",
          "sourcePath": "src/styles.css",
          "kind": "shared",
          "bytes": 5655,
          "sha256": "29f12b25c7c28934469eaf4924edc1ff43e31d36cbf7b1314ef36351c850e99f"
        }
      ],
      "excluded": [],
      "errors": [],
      "warnings": [
        "基于字面量 import 与调用的静态分析；变量路径、远程资源及运行时配置需人工核对。",
        "共享 UI、全局 Tailwind 主题、路由、PluginRegistry 与 Platform Core 不属于独立模块包。",
        "表与 SQL 函数统计包含共享文件的传递引用，并不等于模块专属数据库依赖。",
        "这是实际源代码审查包，不是已验证的独立可安装插件；installable 始终为 false。",
        "源文件按原路径包含；资产保留 src/assets 相对位置以避免破坏引用。",
        "静态敏感信息筛查不是完整安全审计；动态资产、外部服务及目标平台权限需要人工核对。"
      ],
      "cycles": [],
      "configuration": [],
      "dependencies": [
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
      "database": [],
      "installable": false,
      "canExport": true
    }
  ]
};
