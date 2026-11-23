//! Interactive WebGL signal surface (Rust port of the previous `signal-field.ts`).
//! Renders a static SVG until WebGL is ready; pauses offscreen, in hidden tabs and under reduced motion.
use leptos::prelude::*;

#[island]
pub fn SignalField(label: String) -> impl IntoView {
    let canvas = NodeRef::<leptos::html::Canvas>::new();
    let ready = RwSignal::new(false);
    #[cfg(feature = "hydrate")]
    Effect::new(move |_| {
        if let Some(el) = canvas.get() {
            if gl::start(el).is_some() { ready.set(true); }
        }
    });
    let paths: String = (0..26)
        .map(|i| format!(r#"<path d="M-60 {} Q260 {} 560 {} T1260 {}"/>"#, 150 + i * 8, -120 + i * 12, 220 + i * 5, 100 + i * 9))
        .collect();
    let svg = format!(r##"<defs><linearGradient id="signal-gradient" x1="0" x2="1"><stop offset="0" stop-color="#00d4ff"/><stop offset="1" stop-color="#5865f2"/></linearGradient></defs>{paths}"##);
    view! {
        <div class="signal" data-ready=move || ready.get().to_string()>
            <svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true" inner_html=svg></svg>
            <canvas node_ref=canvas aria-hidden="true"></canvas>
            <span class="signal-readout">{label}</span>
        </div>
    }
}

#[cfg(feature = "hydrate")]
mod gl {
    use std::cell::{Cell, RefCell};
    use std::rc::Rc;
    use wasm_bindgen::{prelude::*, JsCast};
    use web_sys::{HtmlCanvasElement, WebGlRenderingContext as Gl};

    const VERTEX: &str = r#"
      attribute vec2 aPosition;
      uniform float uTime; uniform float uAspect; uniform vec2 uPointer;
      varying float vHeight; varying float vDepth;
      void main() {
        vec2 p = aPosition;
        float r = length(p * vec2(.8, 1.0));
        float envelope = exp(-r * r * .055);
        float wave = sin(p.x * 1.35 + p.y * .65 - uTime * .7) + .48 * cos(p.y * 1.8 - p.x * .5 + uTime * .4);
        float h = wave * envelope * .75;
        h += exp(-length(p - uPointer * 3.0) * .7) * .85;
        float yaw = -.28 + uPointer.x * .12;
        float x = p.x * cos(yaw) - p.y * sin(yaw);
        float z = p.x * sin(yaw) + p.y * cos(yaw);
        float y = h * .88 - z * .39;
        float depth = 9.0 + z * .6;
        gl_Position = vec4(x * 1.65 / uAspect, y * 1.65 + .1, 0.0, depth);
        vHeight = h; vDepth = clamp(1.0 - (z + 5.0) * .055, .15, 1.0);
      }"#;
    const FRAGMENT: &str = r#"
      precision mediump float;
      varying float vHeight; varying float vDepth;
      void main() {
        float peak = smoothstep(.3, 1.25, vHeight);
        vec3 cyan = vec3(0.0, 0.83, 1.0);
        vec3 indigo = vec3(0.345, 0.396, 0.949);
        vec3 color = mix(indigo, cyan, peak);
        gl_FragColor = vec4(color, vDepth * (.26 + peak * .7));
      }"#;

    fn shader(gl: &Gl, kind: u32, source: &str) -> Option<web_sys::WebGlShader> {
        let shader = gl.create_shader(kind)?;
        gl.shader_source(&shader, source);
        gl.compile_shader(&shader);
        gl.get_shader_parameter(&shader, Gl::COMPILE_STATUS).as_bool().unwrap_or(false).then_some(shader)
    }

    pub fn start(canvas: HtmlCanvasElement) -> Option<()> {
        let win = web_sys::window()?;
        let reduced = win.match_media("(prefers-reduced-motion: reduce)").ok().flatten().map(|m| m.matches()).unwrap_or(false);
        let attrs = web_sys::WebGlContextAttributes::new();
        attrs.set_alpha(true);
        attrs.set_antialias(true);
        attrs.set_depth(false);
        attrs.set_power_preference(web_sys::WebGlPowerPreference::LowPower);
        let gl: Gl = canvas.get_context_with_context_options("webgl", &attrs).ok()??.dyn_into().ok()?;
        let program = gl.create_program()?;
        gl.attach_shader(&program, &shader(&gl, Gl::VERTEX_SHADER, VERTEX)?);
        gl.attach_shader(&program, &shader(&gl, Gl::FRAGMENT_SHADER, FRAGMENT)?);
        gl.link_program(&program);
        if !gl.get_program_parameter(&program, Gl::LINK_STATUS).as_bool().unwrap_or(false) { return None; }
        gl.use_program(Some(&program));

        let narrow = canvas.client_width() < 600;
        let (columns, rows) = if narrow { (64, 32) } else { (100, 50) };
        let mut positions: Vec<f32> = Vec::with_capacity((columns * rows * 8) as usize);
        for row in 0..=rows {
            for col in 0..columns {
                let x = -7.0 + col as f32 / columns as f32 * 14.0;
                let y = -5.0 + row as f32 / rows as f32 * 10.0;
                positions.extend_from_slice(&[x, y, x + 14.0 / columns as f32, y]);
            }
        }
        for col in 0..=columns {
            for row in 0..rows {
                let x = -7.0 + col as f32 / columns as f32 * 14.0;
                let y = -5.0 + row as f32 / rows as f32 * 10.0;
                positions.extend_from_slice(&[x, y, x, y + 10.0 / rows as f32]);
            }
        }
        let buffer = gl.create_buffer()?;
        gl.bind_buffer(Gl::ARRAY_BUFFER, Some(&buffer));
        let array = js_sys::Float32Array::from(positions.as_slice());
        gl.buffer_data_with_array_buffer_view(Gl::ARRAY_BUFFER, &array, Gl::STATIC_DRAW);
        let attribute = gl.get_attrib_location(&program, "aPosition") as u32;
        gl.enable_vertex_attrib_array(attribute);
        gl.vertex_attrib_pointer_with_i32(attribute, 2, Gl::FLOAT, false, 0, 0);
        let time = gl.get_uniform_location(&program, "uTime");
        let aspect = gl.get_uniform_location(&program, "uAspect");
        let pointer = gl.get_uniform_location(&program, "uPointer");
        gl.enable(Gl::BLEND);
        gl.blend_func(Gl::SRC_ALPHA, Gl::ONE_MINUS_SRC_ALPHA);
        let vertex_count = (positions.len() / 2) as i32;

        let target = Rc::new(Cell::new((0.0f32, 0.0f32)));
        let smoothed = Rc::new(Cell::new((0.0f32, 0.0f32)));
        let visible = Rc::new(Cell::new(true));
        let running = Rc::new(Cell::new(false));
        let elapsed = Rc::new(Cell::new(0.0f64));
        let last = Rc::new(Cell::new(0.0f64));

        let draw = {
            let (gl, canvas, smoothed, target) = (gl.clone(), canvas.clone(), smoothed.clone(), target.clone());
            move |seconds: f32| {
                let dpr = web_sys::window().map(|w| w.device_pixel_ratio()).unwrap_or(1.0).min(if canvas.client_width() < 600 { 1.0 } else { 1.5 });
                let width = ((canvas.client_width() as f64 * dpr).round() as u32).max(1);
                let height = ((canvas.client_height() as f64 * dpr).round() as u32).max(1);
                if canvas.width() != width || canvas.height() != height {
                    canvas.set_width(width);
                    canvas.set_height(height);
                    gl.viewport(0, 0, width as i32, height as i32);
                }
                let (tx, ty) = target.get();
                let (sx, sy) = smoothed.get();
                let next = (sx + (tx - sx) * 0.08, sy + (ty - sy) * 0.08);
                smoothed.set(next);
                gl.clear_color(0.0, 0.0, 0.0, 0.0);
                gl.clear(Gl::COLOR_BUFFER_BIT);
                gl.uniform1f(time.as_ref(), seconds);
                gl.uniform1f(aspect.as_ref(), width as f32 / height as f32);
                gl.uniform2f(pointer.as_ref(), next.0, next.1);
                gl.draw_arrays(Gl::LINES, 0, vertex_count);
            }
        };
        let draw = Rc::new(draw);

        if reduced {
            draw(0.0);
            return Some(());
        }

        // Animation loop at ~30 fps, only while visible.
        let frame: Rc<RefCell<Option<Closure<dyn FnMut(f64)>>>> = Rc::new(RefCell::new(None));
        let frame_ref = frame.clone();
        {
            let (draw, visible, running, elapsed, last) = (draw.clone(), visible.clone(), running.clone(), elapsed.clone(), last.clone());
            *frame.borrow_mut() = Some(Closure::new(move |now: f64| {
                let hidden = web_sys::window().and_then(|w| w.document()).map(|d| d.hidden()).unwrap_or(false);
                if !visible.get() || hidden { running.set(false); last.set(0.0); return; }
                if last.get() == 0.0 || now - last.get() >= 1000.0 / 30.0 {
                    if last.get() > 0.0 { elapsed.set(elapsed.get() + ((now - last.get()).min(100.0)) / 1000.0); }
                    last.set(now);
                    draw(elapsed.get() as f32);
                }
                if let (Some(w), Some(cb)) = (web_sys::window(), frame_ref.borrow().as_ref()) {
                    let _ = w.request_animation_frame(cb.as_ref().unchecked_ref());
                }
            }));
        }
        let kick = {
            let (frame, running) = (frame.clone(), running.clone());
            move || {
                if running.get() { return; }
                running.set(true);
                if let (Some(w), Some(cb)) = (web_sys::window(), frame.borrow().as_ref()) {
                    let _ = w.request_animation_frame(cb.as_ref().unchecked_ref());
                }
            }
        };
        let kick = Rc::new(kick);

        let observer_cb = {
            let (visible, kick) = (visible.clone(), kick.clone());
            Closure::<dyn FnMut(js_sys::Array)>::new(move |entries: js_sys::Array| {
                for entry in entries.iter() {
                    let entry: web_sys::IntersectionObserverEntry = entry.unchecked_into();
                    visible.set(entry.is_intersecting());
                    if entry.is_intersecting() { kick(); }
                }
            })
        };
        if let Ok(observer) = web_sys::IntersectionObserver::new(observer_cb.as_ref().unchecked_ref()) {
            observer.observe(&canvas);
        }
        observer_cb.forget();

        let on_visibility = {
            let kick = kick.clone();
            Closure::<dyn FnMut()>::new(move || kick())
        };
        if let Some(doc) = win.document() {
            let _ = doc.add_event_listener_with_callback("visibilitychange", on_visibility.as_ref().unchecked_ref());
        }
        on_visibility.forget();

        let on_move = {
            let (canvas, target) = (canvas.clone(), target.clone());
            Closure::<dyn FnMut(web_sys::PointerEvent)>::new(move |event: web_sys::PointerEvent| {
                if event.pointer_type() == "touch" { return; }
                let rect = canvas.get_bounding_client_rect();
                let x = ((event.client_x() as f64 - rect.left()) / rect.width() * 2.0 - 1.0) as f32;
                let y = ((event.client_y() as f64 - rect.top()) / rect.height() * 2.0 - 1.0) as f32;
                target.set((x.clamp(-1.0, 1.0), y.clamp(-1.0, 1.0)));
            })
        };
        let _ = canvas.add_event_listener_with_callback("pointermove", on_move.as_ref().unchecked_ref());
        on_move.forget();
        let on_leave = {
            let target = target.clone();
            Closure::<dyn FnMut()>::new(move || target.set((0.0, 0.0)))
        };
        let _ = canvas.add_event_listener_with_callback("pointerleave", on_leave.as_ref().unchecked_ref());
        on_leave.forget();

        kick();
        std::mem::forget(frame);
        Some(())
    }
}
