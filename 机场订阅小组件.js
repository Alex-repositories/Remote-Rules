/*
机场订阅小组件
适用于 Egern

环境变量示例：

name1 = XSUS
url1 = https://xxxxx

name2 = Airport2
url2 = https://xxxxx
*/

async function fetchSub(url) {
  try {
    const resp = await fetch(url);
    const info = resp.headers.get("subscription-userinfo");

    if (!info) {
      return {
        ok: false,
        msg: "无订阅信息"
      };
    }

    const upload = Number(info.match(/upload=(\d+)/)?.[1] || 0);
    const download = Number(info.match(/download=(\d+)/)?.[1] || 0);
    const total = Number(info.match(/total=(\d+)/)?.[1] || 0);
    const expire = Number(resp.headers.get("profile-web-page-expire") || 0);

    const used = upload + download;
    const remain = total - used;

    function format(bytes) {
      const gb = bytes / 1024 / 1024 / 1024;

      if (gb < 1024) {
        return gb.toFixed(2) + " GB";
      }

      return (gb / 1024).toFixed(2) + " TB";
    }

    function formatDate(ts) {
      if (!ts) return "长期有效";

      const d = new Date(ts * 1000);

      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }

    return {
      ok: true,
      remain: format(remain),
      total: format(total),
      expire: formatDate(expire)
    };
  } catch (e) {
    return {
      ok: false,
      msg: "请求失败"
    };
  }
}

async function main() {
  const env = ctx.env;

  const items = [];

  for (let i = 1; i <= 5; i++) {
    const url = env[`url${i}`];

    if (!url) continue;

    const name = env[`name${i}`] || `机场${i}`;

    const data = await fetchSub(url);

    if (data.ok) {
      items.push(
        `${name}\n剩余: ${data.remain}\n总量: ${data.total}\n到期: ${data.expire}`
      );
    } else {
      items.push(
        `${name}\n${data.msg}`
      );
    }
  }

  return {
    title: "机场订阅",
    content: items.join("\n\n")
  };
}

await main();
