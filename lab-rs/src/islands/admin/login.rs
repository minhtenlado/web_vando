use crate::api_admin::admin_login;
use crate::islands::admin::common::{err, reload, Notice, Toast};
use crate::ui::icons::Icon;
use leptos::prelude::*;
use leptos::task::spawn_local;

#[island(lazy)]
pub fn LoginForm() -> impl IntoView {
    let password = RwSignal::new(String::new());
    let busy = RwSignal::new(false);
    let notice = RwSignal::new(None::<Notice>);
    let submit = move |ev: leptos::ev::SubmitEvent| {
        ev.prevent_default();
        if busy.get_untracked() { return; }
        busy.set(true);
        let pw = password.get_untracked();
        spawn_local(async move {
            match admin_login(pw).await {
                Ok(()) => reload(),
                Err(e) => { notice.set(err(e)); busy.set(false); }
            }
        });
    };
    view! {
        <form class="form" on:submit=submit>
            <div class="field">
                <label for="admin-password">"Mật khẩu quản trị"</label>
                <input id="admin-password" class="input" type="password" autocomplete="current-password" required autofocus
                    prop:value=password on:input=move |ev| password.set(event_target_value(&ev)) />
            </div>
            <button class="btn btn-primary" type="submit" disabled=move || busy.get()>
                {move || if busy.get() { "Đang xác thực…" } else { "Đăng nhập" }}<Icon name="arrow-right" />
            </button>
            <Toast notice=notice />
        </form>
    }
}

#[island(lazy)]
pub fn LogoutButton() -> impl IntoView {
    let out = move |_| spawn_local(async move {
        let _ = crate::api_admin::admin_logout().await;
        crate::islands::admin::common::go("/admin");
    });
    view! { <button class="btn btn-sm" type="button" on:click=out><Icon name="arrow-left" /><span>"Đăng xuất"</span></button> }
}
