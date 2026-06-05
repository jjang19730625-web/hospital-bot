import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { MEDICAL_SYSTEM_PROMPT } from '@/lib/system-prompt';
import { ChatRequest, AIAnalysis } from '@/types';

function getOpenAI() {
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY ?? 'placeholder',
    defaultHeaders: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://hospital-bot.vercel.app',
      'X-Title': '병원 AI 환자 상담봇',
    },
  });
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { message, consultation_id, history } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: '메시지를 입력해주세요.' }, { status: 400 });
    }

    const openai = getOpenAI();
    const supabase = getSupabase();

    // 상담 세션 생성 또는 조회
    let consultationId = consultation_id;
    if (!consultationId) {
      const { data, error } = await supabase
        .from('consultations')
        .insert({})
        .select('id')
        .single();

      if (error) throw new Error(`상담 세션 생성 실패: ${error.message}`);
      consultationId = data.id;
    }

    // 환자 메시지 저장
    await supabase.from('messages').insert({
      consultation_id: consultationId,
      role: 'user',
      content: message,
    });

    // 대화 히스토리 구성 (최근 10개)
    const recentHistory = history.slice(-10);
    const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: MEDICAL_SYSTEM_PROMPT },
      ...recentHistory.map((h) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user', content: message },
    ];

    // OpenRouter 호출
    const completion = await openai.chat.completions.create({
      model: 'openrouter/auto',
      messages: chatMessages,
      temperature: 0.3,
      max_tokens: 1500,
    });

    const rawContent = completion.choices[0]?.message?.content || '';

    // JSON 파싱
    let aiMessage = rawContent;
    let analysis: AIAnalysis | undefined;

    try {
      const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/) ||
                        rawContent.match(/(\{[\s\S]*\})/);
      const jsonStr = jsonMatch ? jsonMatch[1] : rawContent;
      const parsed = JSON.parse(jsonStr);
      aiMessage = parsed.message || rawContent;
      analysis = parsed.analysis;
    } catch {
      aiMessage = rawContent;
    }

    // AI 응답 저장
    const { data: savedMessage, error: msgError } = await supabase
      .from('messages')
      .insert({
        consultation_id: consultationId,
        role: 'assistant',
        content: aiMessage,
        intent: analysis?.intent,
        symptoms: analysis?.symptoms,
        department: analysis?.department,
        urgency: analysis?.urgency,
        suspected_diseases: analysis?.suspected_diseases,
      })
      .select('*')
      .single();

    if (msgError) throw new Error(`메시지 저장 실패: ${msgError.message}`);

    return NextResponse.json({
      consultation_id: consultationId,
      message: {
        ...savedMessage,
        analysis,
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
