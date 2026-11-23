//! Contact form: saves to the CMS inbox (and Web3Forms email when configured) through `send_contact`.
use crate::api::send_contact;
use crate::model::Locale;
use crate::ui::icons::Icon;
use leptos::prelude::*;
use leptos::task::spawn_local;

#[island]
pub fn ContactForm(locale: String) -> impl IntoView {
    let locale = Locale::from_code(&locale);
    let name = RwSignal::new(String::new());
    let email = RwSignal::new(String::new());
    let topic = RwSignal::new(String::new());
    let message = RwSignal::new(String::new());
    let website = RwSignal::new(String::new());
    let sending = RwSignal::new(false);
    let status = RwSignal::new(None::<(bool, String)>);
    let submit = move |ev: leptos::ev::SubmitEvent| {
        ev.prevent_default();
        if sending.get_untracked() { return; }
        sending.set(true);
        status.set(None);
        let (n, e, t, m, w) = (name.get_untracked(), email.get_untracked(), topic.get_untracked(), message.get_untracked(), website.get_untracked());
        spawn_local(async move {
            match send_contact(n.clone(), e, t, m, w).await {
                Ok(ticket) => {
                    status.set(Some((true, match locale {
                        Locale::Vi => format!("Cảm ơn {n}! Tin nhắn đã được gửi (mã {ticket}). Tôi sẽ phản hồi sớm nhất có thể."),
                        Locale::En => format!("Thanks {n}! Your message was sent (ticket {ticket}). I'll reply as soon as possible."),
                    })));
                    name.set(String::new()); email.set(String::new()); topic.set(String::new()); message.set(String::new());
                }
                Err(error) => {
                    let text = error.to_string();
                    let text = text.split_once(": ").map(|(_, rest)| rest.to_string()).unwrap_or(text);
                    status.set(Some((false, text)));
                }
            }
            sending.set(false);
        });
    };
    view! {
        <form class="form" on:submit=submit novalidate>
            <div class="form-row">
                <div class="field">
                    <label for="c-name">{locale.t("Họ và tên", "Name")}</label>
                    <input id="c-name" class="input" name="name" autocomplete="name" required minlength="2" maxlength="80" prop:value=name on:input=move |ev| name.set(event_target_value(&ev)) />
                </div>
                <div class="field">
                    <label for="c-email">"Email"</label>
                    <input id="c-email" class="input" type="email" name="email" autocomplete="email" required maxlength="120" prop:value=email on:input=move |ev| email.set(event_target_value(&ev)) />
                </div>
            </div>
            <div class="field">
                <label for="c-topic">{locale.t("Chủ đề", "Topic")}</label>
                <select id="c-topic" class="select" prop:value=topic on:change=move |ev| topic.set(event_target_value(&ev))>
                    <option value="">{locale.t("Chọn chủ đề (không bắt buộc)", "Choose a topic (optional)")}</option>
                    <option value="Hợp tác dự án">{locale.t("Hợp tác dự án", "Project collaboration")}</option>
                    <option value="Thiết kế phần cứng">{locale.t("Thiết kế phần cứng / PCB", "Hardware / PCB design")}</option>
                    <option value="Hệ thống nhúng">{locale.t("Hệ thống nhúng & IoT", "Embedded & IoT")}</option>
                    <option value="AI">{locale.t("AI / Thị giác máy tính", "AI / Computer vision")}</option>
                    <option value="Khác">{locale.t("Khác", "Other")}</option>
                </select>
            </div>
            <div class="field">
                <label for="c-message">{locale.t("Nội dung", "Message")}</label>
                <textarea id="c-message" class="textarea" name="message" required minlength="10" maxlength="4000" prop:value=message on:input=move |ev| message.set(event_target_value(&ev))></textarea>
            </div>
            <div class="honeypot" aria-hidden="true">
                <label>"Website"<input tabindex="-1" autocomplete="off" prop:value=website on:input=move |ev| website.set(event_target_value(&ev)) /></label>
            </div>
            {move || status.get().map(|(ok, text)| view! { <p class="form-status" data-kind=if ok { "ok" } else { "error" } role="status">{text}</p> })}
            <div class="cluster" style="justify-content:space-between">
                <p class="form-note">{locale.t("Tin nhắn được lưu an toàn và chỉ dùng để phản hồi bạn.", "Messages are stored securely and only used to reply to you.")}</p>
                <button type="submit" class="btn btn-primary" data-magnetic="" disabled=move || sending.get()>
                    {move || if sending.get() { locale.t("Đang gửi…", "Sending…") } else { locale.t("Gửi tin nhắn", "Send message") }}
                    <Icon name="send" />
                </button>
            </div>
        </form>
    }
}
