
<div id="loginModal" class="modal fade">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<h4 class="modal-title">Login</h4>
			</div>
			<div class="modal-body">
				<form id="login-form" method="post">

					<label for="Username" class="required">Username <span
						class="required">*</span></label>
					<div class="input-prepend">
						<input name="j_username" id="j_username" type="text"
							placeholder="Username" autocapitalize="off" autocorrect="off" />
					</div>
					<label for="LoginFormPassword" class="required">Password <span
						class="required">*</span></label>
					<div class="input-prepend">
						<input name="j_password" id="j_password" type="password"
							placeholder="Password" />
					</div>
					<div class="hide alert alert-error">Invalid username or
						password, please try again</div>
					<input type="hidden" name="_charset_" value="utf-8" /> <input
						type="hidden" name="j_validate" value="true" />
					<!-- Secret to simulate a enter=submit -->
					<input type="submit" style="visibility: hidden" />
				</form>
			</div>
			<div class="modal-footer">
				<button class="btn btn-primary" id="confirmLoginBtn">Submit</button>
			</div>
		</div>
		<!-- /.modal-content -->
	</div>
	<!-- /.modal-dialog -->
</div>
<!-- /.modal -->
