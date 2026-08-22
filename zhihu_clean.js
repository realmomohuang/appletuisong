/*
 * Quantumult X：知乎界面精简
 *
 * 1. 首页顶栏只保留：关注、推荐、热榜
 * 2. 我的页面保留“推荐问题”
 * 3. 删除创作灵感、创作打卡和其他活动模块
 */

const url = $request.url;
const originalBody = $response.body;

try {
  const obj = JSON.parse(originalBody);

  // 首页顶栏
  if (/\/root\/tab\/v2(?:\?|$)/.test(url)) {
    const allowedTabs = new Set([
      "follow",
      "recommend",
      "hot"
    ]);

    if (Array.isArray(obj.tab_list)) {
      obj.tab_list = obj.tab_list.filter((item) =>
        allowedTabs.has(item && item.tab_type)
      );
    }
  }

  // 我的页面下半部分
  if (/\/api\/v4\/members\/homepage_card(?:\?|$)/.test(url)) {
    if (Array.isArray(obj.list)) {
      const questionCard = obj.list.find(
        (item) =>
          item &&
          item.token === "creation_inspiration_v2"
      );

      if (questionCard && questionCard.data) {
        // questions 对应“推荐问题”
        // topics 对应“创作灵感”
        questionCard.data.topics = [];
        questionCard.data.tab_sort = ["question"];
      }

      // 只留下推荐问题卡片
      // 同时删除：
      // checkin_activity_intro
      // other_activities
      // 以及以后新增的同级推广模块
      obj.list = questionCard ? [questionCard] : [];
    }
  }

  $done({
    body: JSON.stringify(obj)
  });
} catch (error) {
  console.log(`zhihu_clean.js: ${error}`);

  // 解析失败时原样放行，避免返回损坏内容
  $done({
    body: originalBody
  });
}
