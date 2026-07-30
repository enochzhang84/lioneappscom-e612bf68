import { createFileRoute } from "@tanstack/react-router";
import { C1QuestionBank } from "@/components/exam/C1QuestionBank";

export const Route = createFileRoute("/dmv/c1/question-bank")({
  head: () => ({
    meta: [
      { title: "小型车 C1 题库 · 顺序练习 | Lione Apps 驾考宝典" },
      {
        name: "description",
        content:
          "加州 DMV 小型车 C1 完整题库：按顺序浏览全部题目，支持搜索、分类筛选、顺序练习、即时判题、答案解析、收藏与错题本。",
      },
      { property: "og:title", content: "小型车 C1 题库 · 顺序练习" },
      {
        property: "og:description",
        content: "完整 C1 题库浏览与顺序练习：即时判题、答案解析、收藏与错题本，自动记录练习进度。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <C1QuestionBank />,
});
