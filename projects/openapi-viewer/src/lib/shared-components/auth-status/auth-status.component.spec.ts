import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthStatusComponent } from './auth-status.component';
import { TooltipDirective } from '../tooltip/tooltip.directive';
import { TooltipComponent } from '../tooltip/tooltip.component';
import { OpenapiAuthService } from '../../services/openapi-auth.service';
import { OpenapiViewerService } from '../../services/openapi-viewer.service';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';

describe('AuthStatusComponent', () => {
  let component: AuthStatusComponent;
  let fixture: ComponentFixture<AuthStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [OverlayModule, PortalModule],
      declarations: [AuthStatusComponent, TooltipDirective, TooltipComponent],
      providers: [OpenapiAuthService, OpenapiViewerService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
