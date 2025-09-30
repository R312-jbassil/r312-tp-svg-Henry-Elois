import pb from "../../../utils/pb";
import { Collections } from "../../../utils/pocketbase-types";

export async function post({ request }) {
  const body = await request.json();

  try {
    await pb.collection(Collections.SvgCollection).update(body.id, {
      code_svg: body.code_svg,
      chat_history: body.chat_history,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error }), {
      status: 500,
    });
  }
}
