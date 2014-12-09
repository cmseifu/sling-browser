
<form id="login-form" method="post" action="/j_security_check">
<input type="hidden" name=":redirect" value="${request.requestURL}" />
<div id="loginModal" class="modal fade" data-keyboard="false" data-backdrop="static">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<h4 class="modal-title">Sling Browser Login</h4>
			</div>
			<div class="modal-body">
					<div class="hide alert alert-danger" role="alert">Invalid username or
						password, please try again</div>
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
					
					<input type="hidden" name="_charset_" value="utf-8" /> <input
						type="hidden" name="j_validate" value="true" />
					<!-- Secret to simulate a enter=submit -->
					<input type="submit" style="visibility: hidden" />
				
			</div>
			<div class="modal-footer">
				<input type="submit" class="btn btn-primary" id="confirmLoginBtn" value="Submit" />
			</div>
		</div>
		<!-- /.modal-content -->
	</div>
	<!-- /.modal-dialog -->
</div>
<!-- /.modal -->
</form>